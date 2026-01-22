require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Contact = require('../models/Contact');

// Produtos iniciais (mesmo array do admin.js)
const INITIAL_PRODUCTS = [
    // Malha PV
    { name: 'Malha PV Preta', category: 'pv', color: 'Preta', image: 'img/malha-pv-preta.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Bege', category: 'pv', color: 'Bege', image: 'img/malha-pv-bege.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Azul Royal', category: 'pv', color: 'Azul Royal', image: 'img/malha-pv-azul-royal.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Verde Musgo', category: 'pv', color: 'Verde Musgo', image: 'img/malha-pv-verde-musgo.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Cinza Mescla', category: 'pv', color: 'Cinza Mescla', image: 'img/malha-pv-cinza-mescla.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Vermelha', category: 'pv', color: 'Vermelha', image: 'img/malha-pv-vermelha.png', status: 'available', price: 30.00, stock: 100 },

    // Malha PP
    { name: 'Malha PP Preta', category: 'pp', color: 'Preta', image: 'img/malha-pp-preta.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Vinho', category: 'pp', color: 'Vinho', image: 'img/malha-pp-vinho.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Branca', category: 'pp', color: 'Branca', image: 'img/malha-pp-branca.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Azul Marinho', category: 'pp', color: 'Azul Marinho', image: 'img/malha-pp-azul-marinho.png', status: 'available', price: 30.00, stock: 100 },

    // Piquet
    { name: 'Piquet Azul Marinho', category: 'piquet', color: 'Azul Marinho', image: 'img/azul-marinho-piquet-pv.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Vermelho', category: 'piquet', color: 'Vermelho', image: 'img/vermelho-piquet-pv.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Cinza Chumbo', category: 'piquet', color: 'Cinza Chumbo', image: 'img/malha-piquet-pa-cinza-chumbo.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Verde Bandeira', category: 'piquet', color: 'Verde Bandeira', image: 'img/malha-piquet-pa-bandeira.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Branco', category: 'piquet', color: 'Branco', image: 'img/malha-piquet-branca.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Preto', category: 'piquet', color: 'Preto', image: 'img/malha-piquet-preta.png', status: 'available', price: 30.00, stock: 100 },

    // Helanca Light
    { name: 'Helanca Light Preto', category: 'helanca', color: 'Preto', image: 'img/helanca-light-preto.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Bordô', category: 'helanca', color: 'Bordô', image: 'img/helanca-light-bordo.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Azul Royal', category: 'helanca', color: 'Azul Royal', image: 'img/helanca-light-azul-royal.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Rosa Pink', category: 'helanca', color: 'Rosa Pink', image: 'img/helanca-light-rosa-pink.png', status: 'available', price: 30.00, stock: 100 },

    // Algodão
    { name: 'Meia Malha 30.1 Branco', category: 'algodao', color: 'Branco', image: 'img/algodao-branco.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Azul Marinho', category: 'algodao', color: 'Azul Marinho', image: 'img/algodao-azul-marinho.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Vermelho', category: 'algodao', color: 'Vermelho', image: 'img/algodao-vermelho.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Preto', category: 'algodao', color: 'Preto', image: 'img/algodao-preto.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Cinza Claro', category: 'algodao', color: 'Cinza Claro', image: 'img/algodao-cinza-claro.jpg', status: 'available', price: 30.00, stock: 100 },

    // Dry Fit
    { name: 'Dry Fit Preto', category: 'dryfit', color: 'Preto', image: 'img/dry-fit-preto.jpg', status: 'available', price: 30.00, stock: 100 },
    { name: 'Dry Fit Branco', category: 'dryfit', color: 'Branco', image: 'img/dry-fit-branco.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Dry Fit Azul Royal', category: 'dryfit', color: 'Azul Royal', image: 'img/dry-fit.png', status: 'available', price: 30.00, stock: 100 },

    // Viscose
    { name: 'Viscose-Elastano Vermelha', category: 'viscose', color: 'Vermelha', image: 'img/viscose.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Viscose-Elastano Cinza Mescla', category: 'viscose', color: 'Cinza Mescla', image: 'img/viscose-cinza-mescla.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Viscose-Elastano Vinho', category: 'viscose', color: 'Vinho', image: 'img/viscose-vinho.jpg', status: 'available', price: 30.00, stock: 100 },

    // Moletom
    { name: 'Moletom Cinza Mescla', category: 'moletom', color: 'Cinza Mescla', image: 'img/moletom.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Moletom Azul Marinho', category: 'moletom', color: 'Azul Marinho', image: 'img/moletom-azul-marinho.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Moletom Bordô', category: 'moletom', color: 'Bordô', image: 'img/moletom-bordo.jpg', status: 'available', price: 30.00, stock: 100 },

    // Helanca Escolar
    { name: 'Helanca Escolar Verde Bandeira', category: 'helanca-escolar', color: 'Verde Bandeira', image: 'img/helanca-escolar-verde-bandeira.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Escolar Cinza', category: 'helanca-escolar', color: 'Cinza', image: 'img/helanca-escolar-cinza.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Escolar Azul Marinho', category: 'helanca-escolar', color: 'Azul Marinho', image: 'img/helanca-escolar.png', status: 'available', price: 30.00, stock: 100 },

    // Oxford
    { name: 'Oxford Cinza', category: 'oxford', color: 'Cinza', image: 'img/oxford.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Oxford Azul Marinho', category: 'oxford', color: 'Azul Marinho', image: 'img/oxford-azul-marinho.png', status: 'available', price: 30.00, stock: 100 },
    { name: 'Oxford Vermelho', category: 'oxford', color: 'Vermelho', image: 'img/oxford-vermelho.jpg', status: 'available', price: 30.00, stock: 100 }
];

const INITIAL_CONTACT = {
    email: 'contato@nywmalhas.com.br',
    phone: '(XX) XXXX-XXXX',
    whatsapp: '+55 XX XXXXX-XXXX',
    address: '[Seu endereço completo]',
    hours: 'Segunda a Sexta, 08:00 às 18:00',
    facebook: 'https://facebook.com/nywmalhas',
    instagram: '@nywmalhas'
};

async function migrateData() {
    try {
        console.log('🔄  Iniciando migração de dados...');

        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado ao MongoDB Atlas');

        // Limpar coleções existentes (cuidado em produção!)
        await Product.deleteMany({});
        await Contact.deleteMany({});
        console.log('🗑️  Coleções limpas');

        // Inserir produtos
        const products = await Product.insertMany(INITIAL_PRODUCTS);
        console.log(`✅ ${products.length} produtos inseridos`);

        // Inserir contato
        const contact = await Contact.create(INITIAL_CONTACT);
        console.log('✅ Informações de contato inseridas');

        console.log('\n🎉 Migração concluída com sucesso!');
        console.log(`📦 Total de produtos: ${products.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}

// Executar migração
migrateData();
