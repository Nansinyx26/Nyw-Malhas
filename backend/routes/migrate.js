const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Endpoint para atualizar imagens para WebP
router.post('/update-to-webp', async (req, res) => {
    try {
        const products = await Product.find({});
        let updatedCount = 0;

        for (const product of products) {
            if (product.image) {
                let newImage = product.image;

                // Substitui extensões comuns por .webp
                if (newImage.endsWith('.jpg')) {
                    newImage = newImage.replace('.jpg', '.webp');
                } else if (newImage.endsWith('.jpeg')) {
                    newImage = newImage.replace('.jpeg', '.webp');
                } else if (newImage.endsWith('.png')) {
                    newImage = newImage.replace('.png', '.webp');
                }

                if (newImage !== product.image) {
                    await Product.updateOne({ _id: product._id }, { $set: { image: newImage } });
                    updatedCount++;
                }
            }
        }

        res.json({
            success: true,
            message: `${updatedCount} produtos atualizados para WebP`,
            total: products.length,
            updated: updatedCount
        });
    } catch (error) {
        console.error('Erro ao atualizar imagens:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar imagens',
            error: error.message
        });
    }
});

module.exports = router;
