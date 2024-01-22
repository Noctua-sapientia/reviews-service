var express = require('express');
var router = express.Router();
var BookReview = require('../models/bookReview');
var debug = require('debug')('bookReviews-2:server');
const { validateOrderField, validateSortField, validateLimit, validateOffset, validateRating } = require('./validator');
const Book = require("../services/books");
const sendEmail = require('../services/emailService');
const User = require("../services/users");

const cors = require('cors');
const validateJWT = require("../middlewares/validateJWT");

router.use(cors());

/*var book_reviews = [
  {"id": 1, "bookId": 2, "customerId": 3, "description": "El libro es genial, lo recomiendo",
"rating": 5, "creationDate": "13/12/2022", "updatedDate": "15/12/2022"},
{"id": 2, "bookId": 8, "customerId": 3, "description": "El libro es horrible, no lo recomiendo",
"rating": 11, "creationDate": "22/12/2022", "updatedDate": "02/01/2023"},
{"id": 3, "bookId": 2, "customerId": 21, "description": "super bien",
"rating": 4, "creationDate": "28/02/2022", "updatedDate": "28/02/2022"}
]*/

/*GET num reviews
*/
router.get('/count', validateJWT, async function(req, res, next) {
  var bookId = req.query.bookId;
  var customerId = req.query.customerId;

  filter = {};

  if ( bookId ) { filter["bookId"] = bookId }
  if ( customerId ) { filter["customerId"] = customerId }

  try {
    const result = await BookReview.countDocuments(filter);
    if (result) {
      res.status(200).send({count: result});
    } else {
      res.status(200).send({count: 0});
    }
  } catch(e) {
    debug('DB  problem', e);
    console.log(e);
    res.sendStatus(500);
  }
});


/*GET review by id
Return the review that has that id
*/
router.get('/:id', validateJWT, async function(req, res, next) {
  var reviewId = req.params.id;

  try {
    const result = await BookReview.findById(reviewId);
    if (result) {
      res.status(200).send(result.cleanup());
    } else {
      res.status(404).send({error: 'Review not found.'});
    }
  } catch(e) {
    debug('DB  problem', e);
    console.log(e);
    res.sendStatus(500);
  }
});


/*GET return book reviews depending on the filters passed. 
Filters can be, field to order (rating or date), type of order (asc,desc),
bookId if you need only the reviews of book, customerId if you want the book
reviews of a specific client
limit is to put a max number of reviews to get and offset is to indicate the initial 
reviewId to find*/ 

router.get('/', validateJWT, async function(req, res, next) {
  try {

    if ( !validateSortField(req.query.sort) ) { return res.status(400).send("Invalid sort field. It must be 'rating' or 'date'."); }
    let sortat;
    if (req.query.sort) {
      sortat = req.query.sort === 'date' ? 'createdAt' : 'rating';
    } else {
      sortat = 'createdAt';
    }

    
    if ( !validateOrderField(req.query.order) ) { return res.status(400).send("Invalid order field. It must be 'asc' or 'desc'."); }
    let order = req.query.order !== undefined ? req.query.order : 'desc';

    let filters = {};

    if (req.query.bookId !== undefined) { filters["bookId"] = req.query.bookId; }

    if (req.query.customerId !== undefined) { filters["customerId"] = req.query.customerId; }

    if ( !validateLimit(req.query.limit) ) { return res.status(400).send("Limit must be a number greater than 0.") }
    let limit = req.query.limit === undefined ? null : req.query.limit;

    if ( !validateOffset(req.query.offset) ) { return res.status(400).send("Offset must be a non-negative number") }
    let offset = req.query.offset === undefined ? null : req.query.offset;
    
    const result = await BookReview.find(filters).sort([[sortat, order]]).limit(limit).skip(offset);
    if (result.length > 0) {
      res.status(200).send(result.map((r) => r.cleanup()));
    } else {
      res.status(404).send({error: `Review not found.`});
    }
  } catch(e) {
    debug('DB  problem', e);
    res.sendStatus(500);
  }
});

/* POST review of a book. 
Create a new review for a book
*/

router.post('/', validateJWT, async function(req, res, next) {
  const {bookId, customerId, description, rating} = req.body;
  const accessToken = req.headers.authorization;

  const resExistsBook = await Book.existsBook(bookId);
  if (resExistsBook === null) { return res.status(502).send("There is a problem in book microservice"); }
  if ( !resExistsBook ) { return res.status(400).send("There is not exist that book"); }

  if ( !validateRating(rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  //comprobamos si tiene palabras malsonantes AQUI IRIA EL FAAS
  const responseFaas = true;
  //si devuelve q hay palabras malsonantes se manda un correo indicando que no se ha podido crear
  if(responseFaas){
    //buscamos el nombre y email del usuario
    const userOfReview = await User.getCustomerInfo(parseInt(customerId),accessToken);
    const bookDescription = await Book.getBookDescription(bookId);
    sendEmail(userOfReview.name, userOfReview.email,bookDescription, 'crear')

    return res.status(400).send("Review has offensive words.");
  }
  
  try {
    if (!await BookReview.exists({ bookId: bookId, customerId: customerId })) {
      const bookReview = new BookReview({
        bookId,
        customerId,
        description,
        rating
      })

      let containsInsult = await Comment.checkComment(description);
      if (containsInsult === null) { return res.status(502).send("There is a problem in comment service"); }
      if (containsInsult) { 

        // Aquí va el manejo del correo

        return res.status(403).send('You must not use insults');
      }
      
      await bookReview.save();

      let mean_rating = await BookReview.aggregate([
        {
            $match: { "bookId": bookId } // Filtra para obtener solo las reseñas del libro específico
        },
        {
            $group: {
                _id: null, // Agrupa todos los documentos filtrados
                averageRating: { $avg: "$rating" } // Calcula el promedio de la calificación
            }
        }
      ]);
      mean_rating = mean_rating[0].averageRating;
      console.log(mean_rating);
      await Book.updateRatingBook(bookId, mean_rating);

      res.status(201).json(bookReview.cleanup());

    } else {
      res.status(409).json({ error: `There is already a review with bookId=${bookId} and customerId=${customerId}.` });

    }
  } catch (e) {
    if (e.errors) {
      debug("Validation problem when saving");
      res.status(400).send({error: e.message});
    } else {
      debug('DB  problem', e);
      res.sendStatus(500);
    }
  }
});

/*PUT update book review information such as description and rating only those fields*/
router.put('/:id', validateJWT, async function(req, res, next) {

  var reviewId = req.params.id;
  var reviewData = req.body;

  if ( !validateRating(reviewData.rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  try {
    let exists = await BookReview.exists({ bookId: reviewData.bookId, customerId: reviewData.customerId });
    if (!exists) {
      return res.status(404).send('Review not found');
    }
    //comprobamos si tiene palabras malsonantes AQUI IRIA EL FAAS
    const responseFaas = true;
    //si devuelve q hay palabras malsonantes se manda un correo indicando que no se ha podido crear
    if(responseFaas){
      //buscamos el nombre y email del usuario
      const userOfReview = await User.getCustomerInfo(parseInt(customerId),accessToken);
      const bookDescription = await Book.getBookDescription(bookId);
      sendEmail(userOfReview.name, userOfReview.email,bookDescription, 'modificar')

      return res.status(400).send("Review has offensive words.");
    }

    let containsInsult = await Comment.checkComment(reviewData.description);
      if (containsInsult === null) { return res.status(502).send("There is a problem in comment service"); }
      if (containsInsult) { 

        // Aquí va el manejo del correo

        return res.status(403).send('You must not use insults');
      }

    var updatedReview = await BookReview.findByIdAndUpdate(reviewId, reviewData, {
      new: true
    });

    let mean_rating = await BookReview.aggregate([
      {
          $match: { "bookId": reviewData.bookId } // Filtra para obtener solo las reseñas del libro específico
      },
      {
          $group: {
              _id: null, // Agrupa todos los documentos filtrados
              averageRating: { $avg: "$rating" } // Calcula el promedio de la calificación
          }
      }
    ]);
    mean_rating = mean_rating[0].averageRating;
    console.log(mean_rating);
    
    await Book.updateRatingBook(reviewData.bookId, mean_rating);

    res.status(200).json(updatedReview.cleanup());
  } catch (e) {
    if (e.errors) {
      debug("Validation problem when saving");
      res.status(400).send({error: e.message});
    } else {
      debug('DB  problem', e);
      res.sendStatus(500);
    }
  }
});

/* DELETE a bookReview by id*/
router.delete('/:id', validateJWT, async function(req, res, next) {
  var reviewId = req.params.id;
  try {
    await BookReview.deleteOne({_id: reviewId});
    res.sendStatus(200); 
  } catch (e) {
      debug('DB  problem', e);
      res.sendStatus(500);
  }
});

/* DELETE reviews by bookId
Delete all book reviews of a book
*/
router.delete('/', validateJWT, async function(req, res, next) {
  var bookId = req.query.bookId;
  if(bookId !=null) {
    try {
      await BookReview.deleteMany({bookId: bookId});
      res.sendStatus(200); // Ver qué responder si no hay ninguno
    } catch (e) {
        debug('DB  problem', e);
        res.sendStatus(500);
      }
    
  }else{
    res.status(401).send('You must indicate a bookId');
  }  
});

module.exports = router;


