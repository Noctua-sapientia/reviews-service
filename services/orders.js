const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:book');

const BOOK_SERVICE = process.env.BOOK_SERVICE || 'http://localhost:3001';
const API_VERSION = '/api/v1';

const existsOrder = async function(sellerId, customerId) {
    try {
        const url = urlJoin(BOOK_SERVICE, API_VERSION,('/orders?sellerId='+sellerId.toString()+'&userId='+customerId.toString()));
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

module.exports = { 
    existsOrder
}