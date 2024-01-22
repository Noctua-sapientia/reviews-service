const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:book');

const BOOK_SERVICE = process.env.BOOK_SERVICE || 'http://localhost:4002';
const API_VERSION = '/api/v1';

const existsBook = async function(isbn,accessToken) {
    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());
        const headers = {
            Authorization: accessToken
          };
        const config = {
            headers: headers,
          };
        await axios.get(url,config);
        return true;
    } catch (e) {
        if (e.status === 404) {
            return false;
        } else {
            return null;
        }
        
    }
}

const getBookDescription = async function(isbn,accessToken) {
    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());
        const headers = {
            Authorization: accessToken
          };
          const config = {
            headers: headers,
          };
        const response = await axios.get(url,config);
        return response.data.title;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const updateRatingBook = async function(isbn, rating, accessToken) {

    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,'/books/', isbn.toString());
        const headers = {
            Authorization: accessToken
          };
          const config = {
            headers: headers,
          };
        let bookData = await axios.get(url,config);
        let bookDataUpdate = bookData.data;
        bookDataUpdate.rating = rating;
        const response = await axios.put(url, bookDataUpdate, config);
        return response.data;
    } catch (e) {
        console.log(e);
        return null;
    }
}


module.exports = { 
    existsBook,
    updateRatingBook,getBookDescription
}