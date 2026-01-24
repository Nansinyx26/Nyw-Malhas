const mongoose = require('mongoose');
require('dotenv').config();

async function updateAllImagesToWebP() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyw-malhas');
        console.log('✅ Conectado!');

        const Product = mongoose.model('Product', new mongoose.Schema({
            name: String,
            image: String
        }, { strict: false }));

        const products = await Product.find({});
        let updatedCount = 0;

        console.log(`📦 Encontrados ${products.length} produtos. Iniciando atualização...`);

        for (const product of products) {
            if (product.image) {
                let newImage = product.image;

                // Substitui extensões comuns por .webp
                if (newImage.endsWith('.jpg')) newImage = newImage.replace('.jpg', '.webp');
                else if (newImage.endsWith('.jpeg')) newImage = newImage.replace('.jpeg', '.webp');
                else if (newImage.endsWith('.png')) newImage = newImage.replace('.png', '.webp');

                if (newImage !== product.image) {
                    await Product.updateOne({ _id: product._id }, { $set: { image: newImage } });
                    console.log(`✅ Atualizado: ${product.name} -> ${newImage}`);
                    updatedCount++;
                }
            }
        }

        console.log(`\n🎉 Processo finalizado. ${updatedCount} produtos atualizados para WebP.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateAllImagesToWebP();
