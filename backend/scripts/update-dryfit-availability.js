const mongoose = require('mongoose');
require('dotenv').config();

// Schema do produto
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    color: String,
    image: String,
    stock: { type: Number, default: 0 },
    price: Number,
    description: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function updateDryFitAvailability() {
    try {
        console.log('🔗 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyw-malhas');
        console.log('✅ Conectado ao MongoDB');

        // Define estoque 0 para todos os produtos Dry Fit
        const resultAll = await Product.updateMany(
            { category: 'dryfit' },
            { $set: { stock: 0 } }
        );
        console.log(`📦 Estoque zerado para ${resultAll.modifiedCount} produtos Dry Fit`);

        // Define estoque 1 apenas para Dry Fit Branco
        const resultWhite = await Product.updateOne(
            { category: 'dryfit', color: 'Branco' },
            { $set: { stock: 1 } }
        );
        console.log(`✅ Dry Fit Branco disponível: ${resultWhite.modifiedCount} produto(s) atualizado(s)`);

        // Verifica os produtos Dry Fit
        const dryFitProducts = await Product.find({ category: 'dryfit' });
        console.log('\n📋 Produtos Dry Fit:');
        dryFitProducts.forEach(p => {
            const status = p.stock > 0 ? '🟢 DISPONÍVEL' : '🔴 INDISPONÍVEL';
            console.log(`  ${status} - ${p.name} (Estoque: ${p.stock})`);
        });

        console.log('\n✅ Atualização concluída!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateDryFitAvailability();
