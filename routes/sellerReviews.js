var express = require('express');
var router = express.Router();
var SellerReview = require('../models/sellerReview');
var debug = require('debug')('sellerReviews-2:server');





/* GET reviews of sellers listing. */
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
      if (allowedOrderFields.includes(req.query.order)){
        order = req.query.order;
      } else {
        return res.status(400).send("Invalid order field. It must be 'asc' or 'desc'. ");
      }
    } else {
      order = 'desc';
    }

    let filters = {};
    if (!isNaN(req.query.sellerId)) {
      filters["sellerId"] = req.query.sellerId;
    } else if (req.query.sellerId) {
      return res.status(400).send("SellerId must be a number.");
    }
    
    if (!isNaN(req.query.customerId)) {
      filters["customerId"] = req.query.customerId;
    } else if (req.query.customerId) {
      return res.status(400).send("CustomerId must be a number.");
    }

    let limit = null;
    if (!isNaN(req.query.limit)) {
      limit = req.query.limit
    } else if (req.query.limit) {
      return res.status(400).send("Limit must be a number.");
    }

    let skip = 0;
    if (!isNaN(req.query.skip)) {
      skip = req.query.skip;
    } else if (req.query.skip) {
      return res.status(400).send("Skip must be a number.");
    }
    
    const result = await SellerReview.find(filters).sort([[sortat, order]]).limit(limit).skip(skip);
    res.status(200).send(result.map((r) => r.cleanup()));
  } catch(e) {
    debug('DB  problem', e);
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

  try {
    if (!await SellerReview.exists({ sellerId: sellerId, customerId: customerId })) {

      const sellerReview = new SellerReview({
        sellerId,
        customerId,
        description,
        rating
      })
      
      await sellerReview.save();
      res.sendStatus(201);
    } else {
      res.status(409).send(`There is already a review with sellerId=${sellerId} and customerId=${customerId}.`);
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
/* PUT sellerReview */
router.put('/:id', async function(req, res, next) {

  var reviewId = req.params.id;
  var reviewData = req.body;
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