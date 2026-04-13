const mongoose = require('mongoose');
require('dotenv').config();

async function updateMalhaPPImage() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyw-malhas');
        console.log('✅ Conectado!');

        const Product = mongoose.model('Product', new mongoose.Schema({
            name: String,
            category: String,
            image: String
        }, { strict: false }));

        const result = await Product.updateOne(
            { name: 'Malha PP Azul Marinho', category: 'pp' },
            { $set: { image: 'img/malha-pp-azul-marinho.png' } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Imagem atualizada com sucesso para .png');
        } else {
            console.log('⚠️ Nenhuma alteração feita (produto não encontrado ou já atualizado).');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateMalhaPPImage();
