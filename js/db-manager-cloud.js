// ===== DB-MANAGER-CLOUD.JS - Adaptador para MongoDB Atlas =====
// Este arquivo substitui a lógica de IndexedDB por chamadas HTTP ao backend

// Compatibilidade com código antigo
window.DBManager = {
    ready: false,

    async init() {
        try {
            // Testa conexão com backend
            const response = await fetch('http://localhost:5000/');
            if (response.ok) {
                this.ready = true;
                console.log('✅ MongoDB Backend conectado!');
            }
        } catch (error) {
            console.warn('⚠️ Backend não disponível, usando IndexedDB como fallback');
            // TODO: Carregar db-manager.js original como fallback
        }
        return this.ready;
    },

    async getAllProducts() {
        try {
            return await window.APIClient.getAllProducts();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    },

    async getProduct(id) {
        try {
            return await window.APIClient.getProduct(id);
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    },

    async saveProduct(product, imageFile = null) {
        try {
            // Se há arquivo de imagem, converter para Base64 (simplificado)
            if (imageFile) {
                // TODO: Implementar upload de imagem ou conversão para Base64
                console.warn('Upload de imagem ainda não implementado');
            }

            if (product._id) {
                // Atualizar existente
                const { _id, ...productData } = product;
                return await window.APIClient.updateProduct(_id, productData);
            } else {
                // Criar novo
                return await window.APIClient.createProduct(product);
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            return await window.APIClient.deleteProduct(id);
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            throw error;
        }
    },

    async getContact() {
        try {
            return await window.APIClient.getContact();
        } catch (error) {
            console.error('Erro ao buscar contato:', error);
            return null;
        }
    },

    async saveContact(contactData) {
        try {
            return await window.APIClient.updateContact(contactData);
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
            throw error;
        }
    },

    async getStats() {
        try {
            return await window.APIClient.getStats();
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalProducts: 0,
                availableProducts: 0,
                unavailableProducts: 0
            };
        }
    }
};

console.log('📦 DB Manager (MongoDB Cloud) carregado');
