require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Contact = require('../models/Contact'); // Assumindo base directory backend/scripts

async function updateContact() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Conectado.');

        // Deleta todos os contatos existentes antes
        await Contact.deleteMany({});

        const newContact = await Contact.create({
            email: 'geanoliveirafarias@gmail.com',
            phone: '(19) 98160-0429',
            whatsapp: '19981600429',
            address: 'Rua São vito 1140 Santa Cruz americana sp 13477350',
            hours: 'Segunda a sexta das 8:00 às 18:00\nSábado das 8:00 às 12:00',
            facebook: 'https://facebook.com/nywmalhas', // preservado
            instagram: '@nywmalhas' // preservado
        });

        console.log('✅ Contato atualizado com sucesso no MongoDB:', newContact);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar contato:', error);
        process.exit(1);
    }
}

updateContact();
