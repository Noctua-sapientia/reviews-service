var express = require('express');
var router = express.Router();

var sellerReviews = [
  {
    "id":1,
    "sellerId": 1,
    "customerId": 1,
    "description": "Muy buen trato",
    "rating": 5,
    "creationDate": "fecha",
    "modificationDate": "fecha2"
   },
   {
    "id":2,
    "sellerId": 2,
    "customerId": 1,
    "description": "Tarda mucho en enviar los pedidos",
    "rating": 2,
    "creationDate": "fecha",
    "modificationDate": "fecha2"
   }
]

/* GET reviews of sellers listing. */
router.get('/sellers', function(req, res, next) {
  res.send(sellerReviews);
});


/* GET /reviews/sellers/{id} */
router.get('/sellers/:id', function(req, res, next) {
  var sellerId = req.params.id;
  var result = sellerReviews.find(r => {
    return r.sellerId == sellerId;
  })
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({error: 'Review not found.'});
  }
});

/* GET /reviews/sellers?sellerid=id */
router.get('/', function(req, res, next) {
  var sellerId = parseInt(req.query.sellerId,10);
  var result = sellerReviews.find(r => {
    return r.sellerId == sellerId;
  })
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({error: `Review for sellerId ${sellerId} not found.`});
  }
});


/* POST sellerReview */
router.post('/sellers', function(req, res, next) {

  // Add data
  var sellerReview = req.body;

  // Add id
  var maxId = 0;                                                                                
  sellerReviews.forEach(review => {
    if (review.id > maxId) {
      maxId = review.id;
  }});
  sellerReview.id = maxId + 1;

  try {
    sellerReviews.push(sellerReview);
    res.status(201).send({ message: `New review id=${sellerReview.id} created successfully`});
  } catch (e) {
    return res.status(500).send({ error: "An error occurred while creating the review" });
  }

});



/* PUT sellerReview */
router.put('/sellers/:id', function(req, res, next) {
  var reviewId = req.params.id;
  var result = sellerReviews.find(r => {
    return r.id == reviewId;
  })

  if (result) {

    var item = {
      "description": req.body.description,
      "rating": req.body.rating,
      "modificationDate": req.body.modificationDate
    };

    Object.assign(result, item);

    res.status(200).send({ message: `Review id=${reviewId} updated successfully` });


  } else {
    res.sendStatus(404);
  }
});


/* DELETE sellerReview from reviewId*/
router.delete('/sellers/:id', function(req, res, next) {
  var reviewId = req.params.id;

  var result = sellerReviews.find(r => {
    return r.id == reviewId;
  })
  if (result) {
    sellerReviews = sellerReviews.filter(r => {
      return r.id != reviewId;
    }) 
    res.status(200).send({ message: `Seller review id=${reviewId} deleted successfully`});
  } else {
    res.sendStatus(404);
  }
});