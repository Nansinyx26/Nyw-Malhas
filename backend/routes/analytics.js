const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/by-category', analyticsController.getByCategory);
router.get('/low-stock', analyticsController.getLowStock);
router.get('/out-of-stock', analyticsController.getOutOfStock);
router.get('/stock-timeline', analyticsController.getStockTimeline);
router.get('/top-products', analyticsController.getTopProducts);

module.exports = router;
