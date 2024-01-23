const CircuitBreaker = require('opossum');
const Book = require("../services/books");

const invokeUpdateBookRating= async (bookId, mean_rating,accessToken) => {
  try {
    const book = await Book.updateRatingBook(bookId, mean_rating,accessToken);
    return book;
  } catch (error) {
    throw new Error(`Error calling method Book.updateRatingBook: ${error.message}`);
  }
};

const options = {
    timeout: 3000, 
    errorThresholdPercentage: 50, 
    resetTimeout: 30000 
  };

const breakerBook = new CircuitBreaker(invokeUpdateBookRating, options);

const fireUpdateRatingBook = async (bookId, mean_rating,accessToken) => {
  try {
    const result = await breakerBook.fire(bookId, mean_rating,accessToken);
    return result;
  } catch (error) {
    throw new Error(`Error calling method User.getCustomerInfo: ${error.message}`);
  }
};

module.exports = { fireUpdateRatingBook };