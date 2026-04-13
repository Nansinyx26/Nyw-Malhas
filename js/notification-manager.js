// ===== NOTIFICATION-MANAGER.JS - Sistema de Notificações Push =====

class NotificationManager {
    constructor() {
        this.sseConnection = null;
        this.enabled = false;
        this.toastContainer = null;
        this.unreadCount = 0;
        this.notifications = [];
        this.apiBaseUrl = 'http://localhost:5000/api';
    }

    // Inicializar sistema de notificações
    async init() {
        console.log('📢 Inicializando sistema de notificações...');

        // Criar container de toasts se não existir
        this.createToastContainer();

        // Solicitar permissão para notificações do navegador
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log(`🔔 Permissão de notificações: ${permission}`);
        }

        // Conectar ao SSE stream
        this.connectToStream();

        // Carregar notificações não lidas
        await this.loadUnreadNotifications();

        this.enabled = true;
    }

    // Criar container para toasts
    createToastContainer() {
        if (document.getElementById('notification-toast-container')) return;

        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'notification-toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.toastContainer);
    }

    // Conectar ao SSE stream
    connectToStream() {
        if (this.sseConnection) {
            this.sseConnection.close();
        }

        this.sseConnection = new EventSource(`${this.apiBaseUrl}/notifications/stream`);

        this.sseConnection.onopen = () => {
            console.log('✅ Conectado ao stream de notificações');
        };

        this.sseConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type !== 'connected') {
                this.handleNotification(data);
            }
        };

        this.sseConnection.onerror = (error) => {
            console.error('❌ Erro no SSE:', error);
            // Reconectar após 5 segundos
            setTimeout(() => this.connectToStream(), 5000);
        };
    }

    // Processar notificação recebida
    handleNotification(notification) {
        console.log('📩 Nova notificação:', notification);

        this.notifications.unshift(notification);
        this.unreadCount++;

        // Atualizar badge de contador
        this.updateBadge();

        // Mostrar toast visual
        this.showToast(notification);

        // Notificação do navegador
        this.showBrowserNotification(notification);

        // Emitir evento customizado
        window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    }

    // Mostrar toast visual
    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.style.cssText = `
            background: linear-gradient(135deg, rgba(20, 20, 25, 0.98) 0%, rgba(30, 30, 40, 0.98) 100%);
            border-left: 4px solid ${this.getColorByType(notification.type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
            animation: slideIn 0.3s ease;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${this.getIconByType(notification.type)}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${notification.title}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${notification.message}</div>
                    <div style="font-size: 0.75rem; opacity: 0.5; margin-top: 4px;">
                        ${new Date(notification.createdAt).toLocaleTimeString('pt-BR')}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    opacity: 0.5;
                    cursor: pointer;
                    font-size: 20px;
                    padding: 0 5px;
                ">&times;</button>
            </div>
        `;

        toast.addEventListener('mouseenter', () => {
            toast.style.transform = 'translateX(-5px) scale(1.02)';
        });

        toast.addEventListener('mouseleave', () => {
            toast.style.transform = 'translateX(0) scale(1)';
        });

        toast.addEventListener('click', () => {
            this.markAsRead(notification._id);
            toast.remove();
        });

        this.toastContainer.appendChild(toast);

        // Auto-remover após 8 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 8000);
    }

    // Notificação do navegador
    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const nativeNotif = new Notification(notification.title, {
                body: notification.message,
                icon: '/img/logo3.png',
                badge: '/img/logo3.png',
                tag: notification._id
            });

            nativeNotif.onclick = () => {
                window.focus();
                nativeNotif.close();
                this.markAsRead(notification._id);
            };
        }
    }

    // Carregar notificações não lidas
    async loadUnreadNotifications() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/notifications?read=false&limit=10`);
            const data = await response.json();

            if (data.success) {
                this.notifications = data.data;
                this.unreadCount = data.unreadCount;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }

    // Marcar notificação como lida
    async markAsRead(id) {
        try {
            await fetch(`${this.apiBaseUrl}/notifications/${id}/read`, {
                method: 'PATCH'
            });

            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateBadge();
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    }

    // Marcar todas como lidas
    async markAllAsRead() {
        try {
            await fetch(`${this.apiBaseUrl}/notifications/read-all`, {
                method: 'PATCH'
            });

            this.unreadCount = 0;
            this.updateBadge();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    }

    // Atualizar badge de contador
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // Cor por tipo de notificação
    getColorByType(type) {
        const colors = {
            'stock_low': '#ff9800',
            'stock_zero': '#f44336',
            'stock_updated': '#2196F3',
            'new_order': '#4CAF50',
            'order_status_change': '#9C27B0'
        };
        return colors[type] || '#2196F3';
    }

    // Ícone por tipo
    getIconByType(type) {
        const icons = {
            'stock_low': '⚠️',
            'stock_zero': '🚨',
            'stock_updated': '📦',
            'new_order': '🛒',
            'order_status_change': '📦'
        };
        return icons[type] || '🔔';
    }

    // Destruir conexão
    disconnect() {
        if (this.sseConnection) {
            this.sseConnection.close();
            this.sseConnection = null;
        }
        this.enabled = false;
    }
}

// Adicionar CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Exportar instância global
window.notificationManager = new NotificationManager();

console.log('📦 Notification Manager carregado');
