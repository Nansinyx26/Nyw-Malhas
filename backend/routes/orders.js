const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Rotas públicas
router.post('/', orderController.createOrder);
router.get('/track/:orderNumber', orderController.trackOrder);

// Rotas admin (sem autenticação por enquanto, adicionar JWT depois)
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
