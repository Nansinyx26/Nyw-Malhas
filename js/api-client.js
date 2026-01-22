// ===== API CLIENT - Comunicação com MongoDB Backend =====

class APIClient {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
    }

    // Helper para fazer requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // ===== PRODUTOS =====

    async getAllProducts() {
        const response = await this.request('/products');
        return response.data || [];
    }

    async getProduct(id) {
        const response = await this.request(`/products/${id}`);
        return response.data;
    }

    async createProduct(productData) {
        const response = await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        return response.data;
    }

    async updateProduct(id, productData) {
        const response = await this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
        return response.data;
    }

    async deleteProduct(id) {
        const response = await this.request(`/products/${id}`, {
            method: 'DELETE'
        });
        return response.data;
    }

    async updateMassPrice(category, price) {
        const response = await this.request('/products/mass-price', {
            method: 'PUT',
            body: JSON.stringify({ category, price })
        });
        return response.data;
    }

    async getStats() {
        const response = await this.request('/products/stats');
        return response.data;
    }

    // ===== CONTATO =====

    async getContact() {
        const response = await this.request('/contact');
        return response.data;
    }

    async updateContact(contactData) {
        const response = await this.request('/contact', {
            method: 'PUT',
            body: JSON.stringify(contactData)
        });
        return response.data;
    }
}

// Exportar instância global
window.APIClient = new APIClient();
console.log('📡 API Client inicializado');
