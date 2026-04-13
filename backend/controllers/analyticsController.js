const Product = require('../models/Product');
const Order = require('../models/Order');
const StockHistory = require('../models/StockHistory');

// @desc    Get dashboard overview
// @route   GET /api/analytics/overview
// @access  Private (Admin)
exports.getOverview = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const productsAvailable = await Product.countDocuments({ stock: { $gt: 0 } });
        const productsOutOfStock = await Product.countDocuments({ stock: 0 });
        const productsLowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });

        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: '$stock' } } }
        ]);

        const avgStock = await Product.aggregate([
            { $group: { _id: null, avg: { $avg: '$stock' } } }
        ]);

        const inventoryValue = await Product.aggregate([
            { $group: { _id: null, value: { $sum: { $multiply: ['$stock', '$price'] } } } }
        ]);

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        res.json({
            success: true,
            data: {
                products: {
                    total: totalProducts,
                    available: productsAvailable,
                    outOfStock: productsOutOfStock,
                    lowStock: productsLowStock
                },
                stock: {
                    total: totalStock[0]?.total || 0,
                    average: Math.round(avgStock[0]?.avg || 0),
                    inventoryValue: inventoryValue[0]?.value || 0
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar overview',
            error: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/analytics/by-category
// @access  Private (Admin)
exports.getByCategory = async (req, res) => {
    try {
        const byCategory = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: byCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados por categoria',
            error: error.message
        });
    }
};

// @desc    Get low stock products
// @route   GET /api/analytics/low-stock
// @access  Private (Admin)
exports.getLowStock = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;

        const lowStockProducts = await Product.find({
            stock: { $gt: 0, $lte: threshold }
        }).sort({ stock: 1 });

        res.json({
            success: true,
            count: lowStockProducts.length,
            data: lowStockProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos com estoque baixo',
            error: error.message
        });
    }
};

// @desc    Get out of stock products
// @route   GET /api/analytics/out-of-stock
// @access  Private (Admin)
exports.getOutOfStock = async (req, res) => {
    try {
        const outOfStockProducts = await Product.find({ stock: 0 });

        res.json({
            success: true,
            count: outOfStockProducts.length,
            data: outOfStockProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos sem estoque',
            error: error.message
        });
    }
};

// @desc    Get stock timeline (last 30 days)
// @route   GET /api/analytics/stock-timeline
// @access  Private (Admin)
exports.getStockTimeline = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const timeline = await StockHistory.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day: { $dayOfMonth: '$timestamp' }
                    },
                    totalChanges: { $sum: 1 },
                    stockAdded: {
                        $sum: {
                            $cond: [{ $gt: ['$difference', 0] }, '$difference', 0]
                        }
                    },
                    stockRemoved: {
                        $sum: {
                            $cond: [{ $lt: ['$difference', 0] }, { $abs: '$difference' }, 0]
                        }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({
            success: true,
            data: timeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar timeline de estoque',
            error: error.message
        });
    }
};

// @desc    Get top products by stock
// @route   GET /api/analytics/top-products
// @access  Private (Admin)
exports.getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'stock'; // stock ou value

        let sortCriteria = { stock: -1 };
        if (sortBy === 'value') {
            // Criar campo virtual para ordenar por valor
            const products = await Product.aggregate([
                {
                    $addFields: {
                        totalValue: { $multiply: ['$stock', '$price'] }
                    }
                },
                { $sort: { totalValue: -1 } },
                { $limit: limit }
            ]);

            return res.json({
                success: true,
                data: products
            });
        }

        const topProducts = await Product.find().sort(sortCriteria).limit(limit);

        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar top produtos',
            error: error.message
        });
    }
};
