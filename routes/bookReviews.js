var express = require('express');
var router = express.Router();
var fakeservice= require('../services/fakeservice');
var BookReview = require('../models/bookReview');
var debug = require('debug')('bookReviews-2:server');

/*var book_reviews = [
  {"id": 1, "bookId": 2, "customerId": 3, "description": "El libro es genial, lo recomiendo",
"rating": 5, "creationDate": "13/12/2022", "updatedDate": "15/12/2022"},
{"id": 2, "bookId": 8, "customerId": 3, "description": "El libro es horrible, no lo recomiendo",
"rating": 11, "creationDate": "22/12/2022", "updatedDate": "02/01/2023"},
{"id": 3, "bookId": 2, "customerId": 21, "description": "super bien",
"rating": 4, "creationDate": "28/02/2022", "updatedDate": "28/02/2022"}
]*/


/*GET review by id
Return the review that has that id
*/
router.get('/:id', async function(req, res, next) {
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
limit is to put a max number of reviews to get and skip is to indicate the initial 
reviewId to find*/ 

router.get('/', async function(req, res, next) {
  try {

    const allowedSortFields = ['rating', 'date'];
    let sortat;
    if (req.query.sort){
      if (allowedSortFields.includes(req.query.sort)) {
        sortat = req.query.sort == 'date' ? 'createdAt' : 'rating';
      } else {
        return res.status(400).send("Invalid sort field. It must be 'rating' or 'date'. ");
      }
    } else {
      sortat = null;
    }

    const allowedOrderFields = ['asc', 'desc'];
    let order;
    if (req.query.order){
      console.log(req.query.order);
      console.log(allowedOrderFields.includes(req.query.order));
      if (allowedOrderFields.includes(req.query.order)){
        order = req.query.order;
      } else {
        return res.status(400).send("Invalid order field. It must be 'asc' or 'desc'. ");
      }
    } else {
      order = 'desc';
    }

    let filters = {};
    if (req.query.bookId) {
      filters["bookId"] = req.query.bookId;
    }
    if (req.query.customerId) {
      filters["customerId"] = req.query.customerId;
    }

    let limit;
    if (req.query.limit) {
      limit = req.query.limit
    } else {
      limit = null;
    }

    let skip;
    if (req.query.skip) {
      skip = req.query.skip;
    } else {
      skip = 0;
    }
    
    const result = await BookReview.find(filters).sort([[sortat, order]]).limit(limit).skip(skip);
    res.status(200).send(result.map((r) => r.cleanup()));
  } catch(e) {
    debug('DB  problem', e);
    res.sendStatus(500);
  }
});

/* POST review of a book. 
Create a new review for a book
*/

router.post('/', async function(req, res, next) {

  const {bookId, customerId, description, rating} = req.body;

  try {
    if (!await BookReview.exists({ bookId: bookId, customerId: customerId })) {

      const bookReview = new BookReview({
        bookId,
        customerId,
        description,
        rating
      })
      
      await bookReview.save();
      res.sendStatus(201);
    } else {
      res.status(409).send(`There is already a review with bookId=${sellerId} and customerId=${customerId}.`);
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
router.put('/:id', async function(req, res, next) {

  var reviewId = req.params.id;
  var reviewData = req.body;
  try {
    var updatedReview = await BookReview.findByIdAndUpdate(reviewId, reviewData, {
      new: true
    });
    if (!updatedReview) {
      return res.status(404).send('Review not found');
    }
    res.sendStatus(200);
  } catch (e) {
    debug('DB  problem', e);
    res.sendStatus(500);
  }
});

/* DELETE a bookReview by id*/
router.delete('/:id', async function(req, res, next) {
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
router.delete('/:bookId?', async function(req, res, next) {
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
    res.status(401).send('You can not delete all book reviews');
  }  
});

module.exports = router;


