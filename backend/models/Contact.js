const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    whatsapp: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    hours: {
        type: String,
        default: 'Segunda a Sexta, 08:00 às 18:00'
    },
    facebook: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
