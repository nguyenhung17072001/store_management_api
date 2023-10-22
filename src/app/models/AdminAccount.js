const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator')
const bcrypt = require('bcrypt')

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const AdminAccount = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    
    
    //createdAt: { type: Date, default: Date.now },
    //updatedAt: { type: Date, default: Date.now },

}, {
    timestamps: true,
});





module.exports = mongoose.model('AdminAccount', AdminAccount);