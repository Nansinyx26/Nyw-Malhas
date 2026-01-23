require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Inicializar Express
const app = express();

// Conectar ao MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: '*', // Permite todas as origens (incluindo file://)
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (dev)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Servir arquivos estáticos da pasta raiz do projeto (frontend)
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));


// Rotas
app.use('/api/products', require('./routes/products'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));

// Rota raiz - serve o site
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rota de status da API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API NYW Malhas está funcionando!',
        version: '2.0.0',
        endpoints: {
            products: '/api/products',
            contact: '/api/contact',
            orders: '/api/orders',
            analytics: '/api/analytics',
            notifications: '/api/notifications'
        }
    });
});

// Tratamento de erro 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Porta
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

module.exports = app;
