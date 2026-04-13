const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📦 Banco de Dados: ${conn.connection.name}`);

        return conn;
    } catch (error) {
        console.error(`❌ Erro ao conectar MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
