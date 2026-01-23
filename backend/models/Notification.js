const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['stock_low', 'stock_zero', 'stock_updated', 'new_order', 'order_status_change'],
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
        oldStock: Number,
        newStock: Number,
        productName: String,
        orderNumber: String,
        oldStatus: String,
        newStatus: String
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Índices
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
