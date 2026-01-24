// Execute este arquivo DEPOIS que o servidor estiver rodando
// Ele usa a conexão já estabelecida do servidor

const mongoose = require('mongoose');
require('dotenv').config();

async function updateViaServerConnection() {
    try {
        console.log('🔄 Conectando ao MongoDB...');

        // Adiciona handler para debug
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose conectado!');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro de conexão:', err.message);
        });

        // Tenta conectar com timeout maior e retry
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 segundos
            socketTimeoutMS: 45000,
        });

        console.log('✅ Conectado ao MongoDB!');

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

                if (newImage.endsWith('.jpg')) {
                    newImage = newImage.replace('.jpg', '.webp');
                } else if (newImage.endsWith('.jpeg')) {
                    newImage = newImage.replace('.jpeg', '.webp');
                } else if (newImage.endsWith('.png')) {
                    newImage = newImage.replace('.png', '.webp');
                }

                if (newImage !== product.image) {
                    await Product.updateOne({ _id: product._id }, { $set: { image: newImage } });
                    console.log(`✅ ${product.name}: ${product.image} → ${newImage}`);
                    updatedCount++;
                }
            }
        }

        console.log(`\n🎉 Concluído! ${updatedCount} de ${products.length} produtos atualizados.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erro detalhado:', error);
        console.error('Mensagem:', error.message);
        if (error.reason) console.error('Razão:', error.reason);
        process.exit(1);
    }
}

updateViaServerConnection();
