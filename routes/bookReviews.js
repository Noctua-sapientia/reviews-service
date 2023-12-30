var express = require('express');
var router = express.Router();
var fakeservice= require('../services/fakeservice');
//var BookReview = require('../models/bookReview');
//var debug = require('debug')('bookReviews-2:server');

var book_reviews = [
  {"id": 1, "bookId": 2, "customerId": 3, "description": "El libro es genial, lo recomiendo",
"rating": 5, "creationDate": "13/12/2022", "updatedDate": "15/12/2022"},
{"id": 2, "bookId": 8, "customerId": 3, "description": "El libro es horrible, no lo recomiendo",
"rating": 11, "creationDate": "22/12/2022", "updatedDate": "02/01/2023"},
{"id": 3, "bookId": 2, "customerId": 21, "description": "super bien",
"rating": 4, "creationDate": "28/02/2022", "updatedDate": "28/02/2022"}
]


/*GET review by id
Devuelve la review que se le pase por id
*/
router.get('/:reviewId', (req, res) => {
  var reviewId = parseInt(req.params.reviewId, 10);
  var result = book_reviews.filter(r => {
    return r.id == reviewId;
  });
  if (result.length > 0){
    res.send(result);
  }else{
    res.sendStatus(404);
  }
});

/* GET reviews by bookId 
Devuelve todas las reviews o las de un libro concreto
*/
router.get('/:bookId?', async function(req, res, next) {
  var bookId = parseInt(req.query.bookId,10);
  console.log(isNaN(bookId));
  try{
    if(!isNaN(bookId)) {
      var result = book_reviews.filter(r => {
        return r.bookId == bookId;
      });
      if (result){
        res.send(result);
      }else{
        res.status(404).send({
          status: 'error',
          comment: 'No se han encontrado reviews para ese libro',
          errorMessage: 'No se han encontrado reviews para ese libro'});
      }
  
    }else{
      var result = book_reviews;//await BookReview.find();
      res.send(result);
    }

  }catch(e){
    debug("DB problem",e);
    res.sendStatus(500);
  }
  
  
});


/* POST review of a book. 
Crea la review de un libro
*/
router.post('/', async function(req, res, next) {
  const {bookId,customerId,description,rating}  = req.body;
  const now = new Date();
 /* const bookReview = new BookReview({bookId, customerId, description, rating,now,now});
  try{
    await bookReview.save();
    return res.sendStatus(201);
  }catch(err){
    debug("DB problem",e);
    res.sendStatus(500);
  }*/
});

/* PUT review of a book. 
Modifica la review de un libro, en el body se le pasara el rating
el customerId y la descripcion
*/
router.put('/:id', function(req, res, next) {
  var reviewId = parseInt(req.params.id, 10);
  var newDescription = req.body.description;
  var newLastModifDate = new Date();
  var newRating = parseInt(req.body.rating, 10);
  var customerId = req.body.customerId;
  //hay que comprobar que el customer de la sesion sea el mismo que el de la 
  //review

  //buscar la review que se va a modificar
  const reviewToUpdate = book_reviews.find(review => review.id === reviewId);
  if (reviewToUpdate) {
    // Actualizamos los datos de la review
    reviewToUpdate.description = newDescription;
    reviewToUpdate.updatedDate = newLastModifDate;
    reviewToUpdate.rating = newRating;

    res.status(200).send({
      status: 'success',
      message: `Review con ID ${reviewId} actualizado correctamente`,
      updatedBook: reviewToUpdate});
  }else{
    res.status(400).send({
      status: 'error',
      comment: 'Los datos no son correctos o no se ha encontrado la review',
      errorMessage: 'Los datos no son correctos o no se ha encontrado la review'});
  }
  
});

/* DELETE reviews by bookId
Elimina todas las reviews de un libro concreto
*/
router.delete('/:bookId?', function(req, res, next) {
  var bookId = req.query.bookId;
  if(bookId !=null) {
    var result = book_reviews.filter(r => 
      r.bookId != bookId
    );
    book_reviews = result;
    if (result){
      res.send(`Todas las revisiones para el libro con ID ${bookId} han sido eliminadas.`);
    }else{
      res.status(404).send(`No se encontraron revisiones para el libro con ID ${bookId}.`);
    }
  }else{
    res.status(404).send(`No se puede borrar todas las reviews`);
  }  
});

module.exports = router;
