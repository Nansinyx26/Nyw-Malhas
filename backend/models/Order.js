const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        taxId: String
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        color: String,
        quantity: { type: Number, required: true },
        unit: { type: String, enum: ['metro(s)', 'quilo(s)'], required: true },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    shipping: {
        method: { type: String, enum: ['Correios', 'Transportadora'], required: true },
        cost: { type: Number, default: 0 },
        address: {
            street: String,
            number: String,
            complement: String,
            neighborhood: String,
            city: String,
            uf: String,
            zip: String
        }
    },
    payment: {
        method: {
            type: String,
            enum: ['Cartão de crédito', 'Pix', 'Boleto'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],
    total: { type: Number, required: true },
    notes: String,
    whatsappSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Middleware para atualizar updatedAt
orderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Método para adicionar ao histórico de status
orderSchema.methods.addStatusChange = function (newStatus, note = '') {
    this.statusHistory.push({
        status: newStatus,
        note: note,
        timestamp: new Date()
    });
    this.status = newStatus;
};

module.exports = mongoose.model('Order', orderSchema);
