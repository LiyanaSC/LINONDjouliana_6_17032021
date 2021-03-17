const mongoose = require('mongoose');
const oneMailOnly = require('mongoose-unique-validator');

const UserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

UserSchema.plugin(oneMailOnly);
module.exports = mongoose.model('User', UserSchema);