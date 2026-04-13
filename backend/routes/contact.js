const express = require('express');
const router = express.Router();
const {
    getContact,
    updateContact
} = require('../controllers/contactController');

// Rotas públicas
router.get('/', getContact);

// Rotas privadas (TODO: adicionar middleware de autenticação)
router.put('/', updateContact);

module.exports = router;
