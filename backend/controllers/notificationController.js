const Notification = require('../models/Notification');
const StockHistory = require('../models/StockHistory');

// Store active SSE connections
let sseClients = [];

// @desc    SSE Stream for real-time notifications
// @route   GET /api/notifications/stream
// @access  Private (Admin)
exports.streamNotifications = (req, res) => {
    // Set headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Adicionar cliente à lista
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    sseClients.push(newClient);

    console.log(`✅ Cliente SSE conectado: ${clientId}. Total de clientes: ${sseClients.length}`);

    // Enviar mensagem inicial
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado ao stream de notificações' })}\n\n`);

    // Enviar últimas 5 notificações não lidas
    Notification.find({ read: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .then(notifications => {
            notifications.forEach(notif => {
                res.write(`data: ${JSON.stringify(notif)}\n\n`);
            });
        });

    // Cleanup quando cliente desconectar
    req.on('close', () => {
        sseClients = sseClients.filter(client => client.id !== clientId);
        console.log(`❌ Cliente SSE desconectado: ${clientId}. Total de clientes: ${sseClients.length}`);
    });
};

// Função para emitir notificação para todos os clientes conectados
exports.emitNotification = (notification) => {
    sseClients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
    console.log(`📢 Notificação emitida para ${sseClients.length} cliente(s)`);
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private (Admin)
exports.getAllNotifications = async (req, res) => {
    try {
        const { type, read, limit = 50 } = req.query;

        let query = {};
        if (type) query.type = type;
        if (read !== undefined) query.read = read === 'true';

        const notifications = await Notification.find(query)
            .populate('productId', 'name image')
            .populate('orderId', 'orderNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({ read: false });

        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar notificações',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Admin)
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar notificação como lida',
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private (Admin)
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} notificações marcadas como lidas`,
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar todas como lidas',
            error: error.message
        });
    }
};

// @desc    Get stock history for a product
// @route   GET /api/products/:id/history
// @access  Private (Admin)
exports.getProductHistory = async (req, res) => {
    try {
        const { limit = 50, days } = req.query;

        let query = { productId: req.params.id };

        if (days) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));
            query.timestamp = { $gte: startDate };
        }

        const history = await StockHistory.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico',
            error: error.message
        });
    }
};

// @desc    Get all stock history
// @route   GET /api/stock-history
// @access  Private (Admin)
exports.getAllStockHistory = async (req, res) => {
    try {
        const { action, limit = 100, page = 1 } = req.query;

        let query = {};
        if (action) query.action = action;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const history = await StockHistory.find(query)
            .populate('productId', 'name category image')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await StockHistory.countDocuments(query);

        res.json({
            success: true,
            count: history.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico geral',
            error: error.message
        });
    }
};
