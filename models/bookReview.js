const mongoose = require('mongoose');

const bookReviewSchema = new mongoose.Schema({
    bookId: {
        type: Number,
        required: true
    },
    customerId: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
},
{
    // This option assigns "createdAt" and "updatedAt" to the schema: 
    // https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
    timestamps: true
});

bookReviewSchema.methods.cleanup = function() {
    return {
        id: this._id,
        bookId: this.bookId,
        customerId: this.customerId,
        description: this.description,
        rating: this.rating,
        createdAt: this.createdAt
    }
}

const BookReview= mongoose.model('BookReview', bookReviewSchema);

module.exports = BookReview;