const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Categoria é obrigatória'],
        enum: ['pv', 'pp', 'piquet', 'helanca', 'algodao', 'dryfit', 'viscose', 'moletom', 'oxford', 'helanca-escolar']
    },
    color: {
        type: String,
        required: [true, 'Cor é obrigatória'],
        trim: true
    },
    image: {
        type: String,
        default: 'img/placeholder.jpg'
    },
    price: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo'],
        default: 30.00
    },
    stock: {
        type: Number,
        default: 100,
        min: [0, 'Estoque não pode ser negativo']
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    }
}, {
    timestamps: true  // Adiciona createdAt e updatedAt automaticamente
});

// Índices para melhor performance
productSchema.index({ category: 1, color: 1 });
productSchema.index({ status: 1 });

// Método para verificar e atualizar status baseado no estoque
productSchema.methods.updateStockStatus = function () {
    // Regra rígida: sem estoque sempre é indisponível
    if (this.stock <= 0) {
        this.status = 'unavailable';
    }
    // NOTA: Se houver estoque, permitimos que o status seja manipulado manualmente (admin)
    // Então removemos o 'else if' que forçava a volta para 'available'
    return this.save();
};

module.exports = mongoose.model('Product', productSchema);
