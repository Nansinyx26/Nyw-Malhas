const Contact = require('../models/Contact');

// @desc    Get contact information
// @route   GET /api/contact
// @access  Public
exports.getContact = async (req, res) => {
    try {
        // Retorna o primeiro (e único) documento de contato
        let contact = await Contact.findOne();

        // Se não existir, cria um padrão
        if (!contact) {
            contact = await Contact.create({
                email: 'contato@nywmalhas.com.br',
                phone: '',
                whatsapp: '',
                address: 'Americana - SP',
                hours: 'Segunda a Sexta, 08:00 às 18:00',
                facebook: 'https://facebook.com/nywmalhas',
                instagram: '@nywmalhas'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar informações de contato',
            error: error.message
        });
    }
};

// @desc    Update contact information
// @route   PUT /api/contact
// @access  Private (Admin only)
exports.updateContact = async (req, res) => {
    try {
        let contact = await Contact.findOne();

        if (!contact) {
            // Se não existir, cria novo
            contact = await Contact.create(req.body);
        } else {
            // Atualiza existente
            contact = await Contact.findByIdAndUpdate(
                contact._id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        res.json({
            success: true,
            message: 'Informações de contato atualizadas com sucesso',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao atualizar informações de contato',
            error: error.message
        });
    }
};

module.exports = exports;
