const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ category: 1, color: 1 });
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao criar produto',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        // Atualiza status baseado no estoque
        await product.updateStockStatus();

        res.json({
            success: true,
            message: 'Produto atualizado com sucesso',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao atualizar produto',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Produto excluído com sucesso',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir produto',
            error: error.message
        });
    }
};

// @desc    Update mass prices by category
// @route   PUT /api/products/mass-price
// @access  Private (Admin only)
exports.updateMassPrice = async (req, res) => {
    try {
        const { category, price } = req.body;

        if (!category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Categoria e preço são obrigatórios'
            });
        }

        const result = await Product.updateMany(
            { category: category },
            { $set: { price: price } }
        );

        res.json({
            success: true,
            message: `Preço atualizado para ${result.modifiedCount} produtos`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar preços em massa',
            error: error.message
        });
    }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Public
exports.getStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const availableProducts = await Product.countDocuments({ status: 'available' });
        const unavailableProducts = await Product.countDocuments({ status: 'unavailable' });

        res.json({
            success: true,
            data: {
                totalProducts,
                availableProducts,
                unavailableProducts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
};
