const rateLimitMiddleware = require("../middlewares/ratelimit");
var express = require('express');
var router = express.Router();
var SellerReview = require('../models/sellerReview');
var debug = require('debug')('sellerReviews-2:server');
const { validateOrderField, validateSortField, validateLimit, validateOffset, validateRating } = require('./validator');
const Order = require('../services/orders');
const User = require("../services/users");
const Email = require('../services/emailService');
const cors = require('cors');
const validateJWT = require("../middlewares/validateJWT");
const Comment = require("../services/checkComment");

router.use(cors());

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'a56d1f7c0c817387a072692731ea60df7c3a6c19d82ddac228a9a4461f8c5a72';
console.log(jwt.sign({}, SECRET_KEY, { expiresIn: '1h' }));

/* GET reviews of sellers listing. */
router.get('/', validateJWT, async function(req, res, next) {
  try {

    if ( !validateSortField(req.query.sort) ) { return res.status(400).send("Invalid sort field. It must be 'rating' or 'date'."); }
    let sortat;
    if (req.query.sort) {
      sortat = req.query.sort === 'date' ? 'createdAt' : 'rating';
    } else {
      sortat = null;
    }

    
    if ( !validateOrderField(req.query.order) ) { return res.status(400).send("Invalid order field. It must be 'asc' or 'desc'."); }
    let order = req.query.order !== undefined ? req.query.order : 'desc';

    let filters = {};

    if (req.query.sellerId !== undefined) { filters["sellerId"] = req.query.sellerId; }

    if (req.query.customerId !== undefined) { filters["customerId"] = req.query.customerId; }

    if ( !validateLimit(req.query.limit) ) { return res.status(400).send("Limit must be a number greater than 0.") }
    let limit = req.query.limit === undefined ? null : req.query.limit;

    if ( !validateOffset(req.query.offset) ) { return res.status(400).send("Offset must be a non-negative number") }
    let offset = req.query.offset === undefined ? null : req.query.offset;
    
    const result = await SellerReview.find(filters).sort([[sortat, order]]).limit(limit).skip(offset);
    if (result.length > 0) {
      res.status(200).send(result.map((r) => r.cleanup()));
    } else {
      res.status(404).send({error: `Review not found.`}); 
    }
  } catch(e) {
    debug('DB  problem', e);
    console.log(e);
    res.sendStatus(500);
  }
});

/*GET num reviews
*/
router.get('/count', validateJWT, async function(req, res, next) {
  var sellerId = req.query.sellerId;
  var customerId = req.query.customerId;

  filter = {};

  if ( sellerId ) { filter["sellerId"] = sellerId }
  if ( customerId ) { filter["customerId"] = customerId }


  try {
    const result = await SellerReview.countDocuments(filter);
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


/* GET /reviews/sellers/{id} */
router.get('/:id', validateJWT, async function(req, res, next) {
  var reviewId = req.params.id;

  try {
    const result = await SellerReview.findById(reviewId);
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


/* POST sellerReview */
router.post('/', validateJWT, rateLimitMiddleware, async function(req, res, next) {
  const accessToken = req.headers.authorization;
  const {sellerId, customerId, description, rating} = req.body;

  const resExistsOrder = await Order.existsOrder(sellerId, customerId,accessToken);
  if (resExistsOrder === null) { return res.status(502).send("There is a problem in orders microservice"); }
  if ( !resExistsOrder ) { return res.status(400).send("The user have not done any order to that seller, so he must not rate him"); }

  if ( !validateRating(rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  try {

    if (!await SellerReview.exists({ sellerId: sellerId, customerId: customerId })) {
      const sellerReview = new SellerReview({
        sellerId,
        customerId,
        description,
        rating
      })

      let containsInsult = await Comment.checkComment(description);
      if (containsInsult === null) { return res.status(502).send("There is a problem in comment service"); }
      if (containsInsult === 'True') { 

        //buscamos el nombre y email del usuario que escribe el comentario
        const userOfReview = await User.getCustomerInfo(parseInt(customerId),accessToken);
        const sellerOfReview = await User.getSellerInfo(parseInt(sellerId),accessToken);
        Email.sendEmail(userOfReview.name, userOfReview.email,'vendedor',sellerOfReview.name, 'crear');

        return res.status(403).send('You must not use insults');
      }
      
      const seller = await sellerReview.save();

      let mean_rating = await SellerReview.aggregate([
        {
            $match: { "sellerId": seller.id } // Filtra para obtener solo las reseñas del libro específico
        },
        {
            $group: {
                _id: null, // Agrupa todos los documentos filtrados
                averageRating: { $avg: "$rating" } // Calcula el promedio de la calificación
            }
        }
      ]);
      mean_rating = mean_rating[0].averageRating;
      
      await User.updateRatingSeller(sellerId, mean_rating,accessToken);

      res.status(201).json(sellerReview.cleanup());
    } else {
      res.status(409).json({ error: `There is already a review with sellerId=${sellerId} and customerId=${customerId}.` });
    }
  } catch (e) {
    if (e.errors) {
      debug("Validation problem when saving");
      res.status(400).send({error: e.message});
    } else {
      debug('DB  problem', e);
      console.log(e);
      res.sendStatus(500);
    }
  }
});



/* PUT sellerReview */
router.put('/:id', validateJWT, rateLimitMiddleware, async function(req, res, next) {
  const accessToken = req.headers.authorization;
  var reviewId = req.params.id;
  var reviewData = req.body;

  if ( !validateRating(reviewData.rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  try {
    let exists = await SellerReview.exists({ sellerId: reviewData.sellerId, customerId: reviewData.customerId });
    if (!exists) {
      return res.status(404).send('Review not found');
    }

    let containsInsult = await Comment.checkComment(reviewData.description);
    if (containsInsult === null) { return res.status(502).send("There is a problem in comment service"); }
    if (containsInsult === 'True') { 

      const userOfReview = await User.getCustomerInfo(parseInt(reviewData.customerId),accessToken);
      const sellerOfReview = await User.getSellerInfo(parseInt(reviewData.sellerId),accessToken);
      Email.sendEmail(userOfReview.name, userOfReview.email,'vendedor',sellerOfReview.name, 'editar');
      
      return res.status(403).send('You must not use insults');
    }

    var updatedReview = await SellerReview.findByIdAndUpdate(reviewId, reviewData, {
      new: true
    });

    let mean_rating = await SellerReview.aggregate([
      {
          $match: { "sellerId": reviewData.sellerId } // Filtra para obtener solo las reseñas del libro específico
      },
      {
          $group: {
              _id: null, // Agrupa todos los documentos filtrados
              averageRating: { $avg: "$rating" } // Calcula el promedio de la calificación
          }
      }
    ]);
    mean_rating = mean_rating[0].averageRating;
    
    await User.updateRatingSeller(reviewData.sellerId, mean_rating,accessToken);
    
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



/* DELETE a sellerReviews by id*/
router.delete('/:id', validateJWT, async function(req, res, next) {
  var reviewId = req.params.id;

  try {
    await SellerReview.deleteOne({_id: reviewId});
    res.sendStatus(200); // Ver qué responder si no hay ninguno
  } catch (e) {
      debug('DB  problem', e);
      res.sendStatus(500);
  }
});

/* DELETE all sellerReviews from one seller by sellerId*/
router.delete('/', validateJWT, async function(req, res, next) {
  var sellerId = req.query.sellerId;
  if (sellerId != null) {
    try {
      await SellerReview.deleteMany({sellerId: sellerId});
      res.sendStatus(200); // Ver qué responder si no hay ninguno
    } catch (e) {
        debug('DB  problem', e);
        res.sendStatus(500);
    }  
  } else {
    res.status(401).send('You must indicate sellerId');
  }

});

module.exports = router;