const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// SSE Stream
router.get('/stream', notificationController.streamNotifications);

// Notificações
router.get('/', notificationController.getAllNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

// Histórico de Estoque
router.get('/stock-history', notificationController.getAllStockHistory);
router.get('/products/:id/history', notificationController.getProductHistory);

module.exports = router;
