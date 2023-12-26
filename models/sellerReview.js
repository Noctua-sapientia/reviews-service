const mongoose = require('mongoose');

const sellerReviewSchema = new mongoose.Schema({
    sellerId: {
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

sellerReviewSchema.methods.cleanup = function() {
    return {
        id: this._id,
        sellerId: this.sellerId,
        customerId: this.customerId,
        description: this.description,
        rating: this.rating,
        createdAt: this.createdAt
    }
}

const SellerReview = mongoose.model('SellerReview', sellerReviewSchema);

module.exports = SellerReview;