/*const mongoose = require('mongoose');

const bookReviewSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book' // Nombre del modelo referenciado
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer' // Nombre del modelo referenciado
    },
    description: {
      type: String,
      required: false
    },
    rating: {
      type: Number,
      required: false
    },
    creationDate: {
        type: Date,
        required: false
    },
    updatedDate: {
        type: Date,
        required: false
    }
});

const BookReview= mongoose.model('BookReview', bookReviewSchema);

module.exports = BookReview;*/