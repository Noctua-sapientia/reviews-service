const axios = require('axios');
const urlJoin = require('url-join');
const debug = require('debug')('reviews:book');

const CHECKCOMMENT_SERVICE = process.env.CHECKCOMMENT_SERVICE || 'https://checkcomment.azurewebsites.net/api/HttpTrigger1?code=nytp3LohfHyd6kwiPVasRBF_jvpD5sSK64uSg5rlIudMAzFuMhnsDg==';

const checkComment = async function(comment) {

    try {
        let containsInsult = await axios.post(CHECKCOMMENT_SERVICE, {frase: comment});
        return containsInsult.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}


module.exports = {
    checkComment
}