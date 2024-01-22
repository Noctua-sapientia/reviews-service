const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:book');

const BOOK_SERVICE = process.env.BOOK_SERVICE || 'http://localhost:4002';
const API_VERSION = '/api/v1';

const existsBook = async function(isbn) {
    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());
        await axios.get(url);
        return true;
    } catch (e) {
        if (e.status === 404) {
            return false;
        } else {
            return null;
        }
        
    }
}

const getBookDescription = async function(isbn) {
    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());
        const response = await axios.get(url);
        return response.data.title;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const updateRatingBook = async function(isbn, rating) {

    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());

        let bookData = await axios.get(url);
        bookData.reviews = rating;

        const response = await axios.put(url, bookData);
        return response.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}


module.exports = { 
    existsBook,
    updateRatingBook,getBookDescription
}