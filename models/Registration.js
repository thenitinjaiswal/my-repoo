// models/Registration.js

const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    event: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    checkedIn: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', RegistrationSchema);
