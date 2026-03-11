const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    role: { type: String, default: 'customer' },
    isRural: { type: Boolean, default: false }, 
    location: { type: String },                
    skills: [{ type: String }],
    photo: { type: String }                  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);;

