const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String, // Desnormalizado para facilitar consultas
    action: {
        type: String,
        enum: ['manual_update', 'order_placed', 'restock', 'initial', 'admin_edit'],
        required: true
    },
    oldStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    difference: Number,
    reason: String,
    userId: String, // Para futuro sistema de autenticação
    metadata: {
        orderId: String,
        adminName: String,
        ip: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Índices para performance
stockHistorySchema.index({ productId: 1, timestamp: -1 });
stockHistorySchema.index({ timestamp: -1 });
stockHistorySchema.index({ action: 1 });

// Virtual para calcular diferença automaticamente
stockHistorySchema.pre('save', function (next) {
    this.difference = this.newStock - this.oldStock;
    next();
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);
