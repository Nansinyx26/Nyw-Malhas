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
        // 1. Buscar produto antes da atualização
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        const oldStock = product.stock;
        const newStock = req.body.stock !== undefined ? req.body.stock : oldStock;

        // 2. Mesclar campos novos (exceto _id)
        const updates = ['name', 'category', 'color', 'image', 'stock', 'status'];
        updates.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        // 3. Salvar usando o documento
        // A lógica de updateStockStatus agora só força 'unavailable' se estoque for 0
        await product.updateStockStatus();
        // O .save() final garante que todas as outras mudanças (nome, cor, image) e o status manual persistam
        await product.save();

        // ✅ REGISTRAR HISTÓRICO se o estoque mudou
        if (oldStock !== newStock) {
            const StockHistory = require('../models/StockHistory');
            const Notification = require('../models/Notification');

            await StockHistory.create({
                productId: product._id,
                productName: product.name,
                action: 'admin_edit',
                oldStock: oldStock,
                newStock: newStock,
                reason: req.body.reason || 'Atualização manual pelo admin',
                metadata: {
                    adminName: req.body.adminName || 'Admin',
                    ip: req.ip
                }
            });

            // ✅ CRIAR NOTIFICAÇÃO
            let notificationType = 'stock_updated';
            let notificationTitle = 'Estoque Atualizado';
            let notificationMessage = `${product.name}: ${oldStock} → ${newStock}`;

            if (newStock === 0 && oldStock > 0) {
                notificationType = 'stock_zero';
                notificationTitle = '⚠️ Estoque Zerado';
                notificationMessage = `${product.name} ficou SEM ESTOQUE!`;
            }

            await Notification.create({
                type: notificationType,
                productId: product._id,
                title: notificationTitle,
                message: notificationMessage,
                data: { oldStock, newStock, productName: product.name }
            });

            console.log(`📊 Histórico registrado: ${product.name} (${oldStock} → ${newStock})`);
        }

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
