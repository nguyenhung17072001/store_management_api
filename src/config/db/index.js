const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/store_management');
        console.log('connect successfully!!!! ');
    } catch(err) {
        console.log('connect fail!!!! ');
    }
}

module.exports = { connect };