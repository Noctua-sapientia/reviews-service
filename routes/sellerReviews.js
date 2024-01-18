var express = require('express');
var router = express.Router();
var SellerReview = require('../models/sellerReview');
var debug = require('debug')('sellerReviews-2:server');
const { validateOrderField, validateSortField, validateLimit, validateSkip, validateRating } = require('./validator');

/* GET reviews of sellers listing. */
router.get('/', async function(req, res, next) {
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

    if ( !validateLimit(req.query.skip) ) { return res.status(400).send("Skip must be a non-negative number") }
    let skip = req.query.skip === undefined ? null : req.query.skip;
    
    const result = await SellerReview.find(filters).sort([[sortat, order]]).limit(limit).skip(skip);
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


/* GET /reviews/sellers/{id} */
router.get('/:id', async function(req, res, next) {
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
router.post('/', async function(req, res, next) {

  const {sellerId, customerId, description, rating} = req.body;

  if ( !validateRating(rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  try {

    if (!await SellerReview.exists({ sellerId: sellerId, customerId: customerId })) {
      const sellerReview = new SellerReview({
        sellerId,
        customerId,
        description,
        rating
      })
      
      await sellerReview.save();
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
      res.sendStatus(500);
    }
  }
});



/* PUT sellerReview */
router.put('/:id', async function(req, res, next) {

  var reviewId = req.params.id;
  var reviewData = req.body;

  if ( !validateRating(reviewData.rating) ) { return res.status(400).send("Rating must be a number between 1 and 5."); }

  try {
    var updatedReview = await SellerReview.findByIdAndUpdate(reviewId, reviewData, {
      new: true
    });
    if (!updatedReview) {
      return res.status(404).send('Review not found');
    }
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
router.delete('/:id', async function(req, res, next) {
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
router.delete('/', async function(req, res, next) {
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