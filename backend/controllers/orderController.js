const Order = require('../models/Order');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Notification = require('../models/Notification');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { customer, items, shipping, payment, total } = req.body;

        // Validar estoque disponível para todos os itens
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Produto ${item.productName} não encontrado`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
                });
            }
        }

        // Gerar número do pedido único
        const orderNumber = `NYW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Criar pedido
        const order = await Order.create({
            orderNumber,
            customer,
            items,
            shipping,
            payment,
            total
        });

        // Decrementar estoque e criar histórico
        for (const item of items) {
            const product = await Product.findById(item.productId);
            const oldStock = product.stock;
            const newStock = oldStock - item.quantity;

            product.stock = newStock;
            await product.updateStockStatus();
            await product.save();

            // Registrar histórico
            await StockHistory.create({
                productId: product._id,
                productName: product.name,
                action: 'order_placed',
                oldStock,
                newStock,
                reason: `Pedido #${orderNumber}`,
                metadata: {
                    orderId: order._id.toString()
                }
            });

            // Notificação se estoque ficou baixo ou zerou
            if (newStock === 0) {
                await Notification.create({
                    type: 'stock_zero',
                    productId: product._id,
                    orderId: order._id,
                    title: '⚠️ Estoque Zerado por Pedido',
                    message: `${product.name} ficou SEM ESTOQUE após pedido #${orderNumber}`,
                    data: { oldStock, newStock, productName: product.name, orderNumber }
                });
            } else if (newStock <= 10) {
                await Notification.create({
                    type: 'stock_low',
                    productId: product._id,
                    orderId: order._id,
                    title: '⚠️ Estoque Baixo',
                    message: `${product.name} está com estoque baixo (${newStock}) após pedido #${orderNumber}`,
                    data: { oldStock, newStock, productName: product.name, orderNumber }
                });
            }
        }

        // Notificação de novo pedido
        await Notification.create({
            type: 'new_order',
            orderId: order._id,
            title: '🛒 Novo Pedido Recebido',
            message: `Pedido #${orderNumber} de ${customer.name} - Total: R$ ${total.toFixed(2)}`,
            data: { orderNumber, customerName: customer.name, total }
        });

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar pedido',
            error: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, startDate, endDate, email } = req.query;

        let query = {};

        if (status) query.status = status;
        if (email) query['customer.email'] = email;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('items.productId', 'name category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar pedidos',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public (by order number) or Private (by ID)
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name category image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar pedido',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }

        const oldStatus = order.status;
        order.addStatusChange(status, note);
        await order.save();

        // Notificação de mudança de status
        await Notification.create({
            type: 'order_status_change',
            orderId: order._id,
            title: '📦 Status do Pedido Alterado',
            message: `Pedido #${order.orderNumber}: ${oldStatus} → ${status}`,
            data: {
                orderNumber: order.orderNumber,
                oldStatus,
                newStatus: status
            }
        });

        res.json({
            success: true,
            message: 'Status atualizado com sucesso',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar status',
            error: error.message
        });
    }
};

// @desc    Cancel order and restore stock
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Pedido já cancelado'
            });
        }

        // Reverter estoque
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                const oldStock = product.stock;
                const newStock = oldStock + item.quantity;

                product.stock = newStock;
                await product.updateStockStatus();
                await product.save();

                await StockHistory.create({
                    productId: product._id,
                    productName: product.name,
                    action: 'order_cancelled',
                    oldStock,
                    newStock,
                    reason: `Cancelamento do pedido #${order.orderNumber}`,
                    metadata: { orderId: order._id.toString() }
                });
            }
        }

        order.addStatusChange('cancelled', req.body.reason || 'Cancelado pelo admin');
        await order.save();

        await Notification.create({
            type: 'order_status_change',
            orderId: order._id,
            title: '❌ Pedido Cancelado',
            message: `Pedido #${order.orderNumber} foi cancelado. Estoque restaurado.`,
            data: { orderNumber: order.orderNumber }
        });

        res.json({
            success: true,
            message: 'Pedido cancelado e estoque restaurado',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar pedido',
            error: error.message
        });
    }
};

// @desc    Get order by order number (for customer tracking)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber })
            .populate('items.productId', 'name image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao rastrear pedido',
            error: error.message
        });
    }
};
