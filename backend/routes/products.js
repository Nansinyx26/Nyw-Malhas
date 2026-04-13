const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateMassPrice,
    getStats
} = require('../controllers/productController');

// Rotas públicas
router.get('/', getAllProducts);
router.get('/stats', getStats);
router.get('/:id', getProduct);

// Rotas privadas (TODO: adicionar middleware de autenticação)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.put('/mass-price', updateMassPrice);

module.exports = router;
