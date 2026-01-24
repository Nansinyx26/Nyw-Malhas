const mongoose = require('mongoose');
require('dotenv').config();

const updates = [
    { name: 'Dry Fit Azul Royal', category: 'dryfit', newImage: 'img/dry-fit-azul-royal.png' },
    { name: 'Helanca Escolar Azul Marinho', category: 'helanca-escolar', newImage: 'img/helanca-escolar-marinho.png' },
    { name: 'Helanca Light Azul Royal', category: 'helanca', newImage: 'img/helanca-light-azul-royal.png' },
    { name: 'Piquet Azul Marinho', category: 'piquet', newImage: 'img/azul-marinho-piquet.png' },
    { name: 'Piquet Vermelho', category: 'piquet', newImage: 'img/vermelho-piquet.jpg' },
    { name: 'Oxford Cinza', category: 'oxford', newImage: 'img/oxford-cinza.png' },
    { name: 'Viscose-Elastano Vermelha', category: 'viscose', newImage: 'img/viscose-vermelha.png' }
];

async function updateImages() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyw-malhas');
        console.log('✅ Conectado!');

        const Product = mongoose.model('Product', new mongoose.Schema({
            name: String,
            category: String,
            image: String
        }, { strict: false })); // strict: false para não validar schema completo

        let count = 0;
        for (const item of updates) {
            const result = await Product.updateOne(
                { name: item.name, category: item.category },
                { $set: { image: item.newImage } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Atualizado: ${item.name} -> ${item.newImage}`);
                count++;
            } else {
                console.log(`⚠️ Não alterado (não encontrado ou já atualizado): ${item.name}`);
            }
        }

        console.log(`\n🎉 Processo finalizado. ${count} produtos atualizados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateImages();
