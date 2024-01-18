// setup connection to mongo
const mongoose = require('mongoose');
// const DB_URL = (process.env.DB_URL || 'mongodb://localhost/test');
const DB_URL = (process.env.DB_URL || "mongodb+srv://rservice:9r3vqhBrfzdYAO2M@review-service.0izau0z.mongodb.net/?retryWrites=true&w=majority")
console.log("Connecting to database: %s", DB_URL);

mongoose.connect(DB_URL);
const db = mongoose.connection;
console.log("Connected to database! %s", DB_URL);

// recover from errors
db.on('error', console.error.bind(console, 'db connection error'));

module.exports = db;