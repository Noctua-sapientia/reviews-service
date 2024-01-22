const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:users');

const USERS_SERVICE = process.env.USERS_SERVICE || 'http://localhost:4001';
const API_VERSION = '/api/v1';

const updateRatingSeller = async function(sellerId, rating,accessToken) {

    try {
        const urlGet = urlJoin(USERS_SERVICE, API_VERSION,'sellers', sellerId.toString());
        const headers = {
            Authorization: accessToken
          };
          const config = {
            headers: headers,
          };

        let sellerData = await axios.get(urlGet,config);
        let sellerDataUpdate = sellerData.data;
        sellerDataUpdate.valoration = rating;
        const urlPut = urlJoin(USERS_SERVICE, API_VERSION,'sellers');
        await axios.put(urlPut, sellerDataUpdate,config);
        return true;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const getCustomerInfo = async function(customerId,accessToken) {

    try {
        const urlGet = urlJoin(USERS_SERVICE, API_VERSION,'customers', customerId.toString());
        const headers = {
            Authorization: accessToken
          };
          const config = {
            headers: headers,
          };

        const response = await axios.get(urlGet,config);
        const customerData = response.data;
        return {email : customerData.email, name : customerData.name};
        
    } catch (e) {
        console.error("Error obtaining customer information:", error.message);
        return null;
    }
}


module.exports = {
    updateRatingSeller, getCustomerInfo
}