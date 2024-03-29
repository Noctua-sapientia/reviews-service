const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:orders');

const ORDER_SERVICE = process.env.ORDER_SERVICE || 'http://localhost:3001';
const API_VERSION = '/api/v1';

const existsOrder = async function(sellerId, customerId,accessToken) {
    try {
        const headers = {
            Authorization: accessToken
          };
          const config = {
            headers: headers,
          };
        const url = urlJoin(ORDER_SERVICE, API_VERSION,('/orders?sellerId='+sellerId.toString()+'&userId='+customerId.toString()));
        await axios.get(urlGet,config);
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