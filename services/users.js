const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:users');

const USERS_SERVICE = process.env.USERS_SERVICE || 'http://localhost:4001';
const API_VERSION = '/api/v1';

const updateRatingSeller = async function(sellerId, rating) {

    try {
        const urlGet = urlJoin(USERS_SERVICE, API_VERSION,'sellers', sellerId.toString());

        let sellerData = await axios.get(urlGet);
        sellerData.data.valoration = rating;
        const urlPut = urlJoin(USERS_SERVICE, API_VERSION,'sellers');
        await axios.put(urlPut, sellerData.data);
        return true;
    } catch (e) {
        console.error(e);
        return null;
    }
}


module.exports = {
    updateRatingSeller
}