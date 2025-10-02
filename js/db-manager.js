/**
 * DB Manager - Sistema de gerenciamento com IndexedDB
 * Substitui localStorage com compactação de imagens
 */

const DB_NAME = 'NYW_MALHAS_DB';
const DB_VERSION = 1;
const STORES = {
    PRODUCTS: 'products',
    CONTACT: 'contact',
    SETTINGS: 'settings'
};

class DatabaseManager {
    constructor() {
        this.db = null;
        this.ready = false;
    }

    /**
     * Inicializa o banco de dados
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Erro ao abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.ready = true;
                console.log('✅ IndexedDB inicializado com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store de produtos
                if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
                    const productStore = db.createObjectStore(STORES.PRODUCTS, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    productStore.createIndex('category', 'category', { unique: false });
                    productStore.createIndex('status', 'status', { unique: false });
                }

                // Store de contato
                if (!db.objectStoreNames.contains(STORES.CONTACT)) {
                    db.createObjectStore(STORES.CONTACT, { keyPath: 'id' });
                }

                // Store de configurações
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                console.log('🗄️ Estrutura do banco criada');
            };
        });
    }

    /**
     * Compacta uma imagem mantendo qualidade
     */
    async compressImage(file, maxWidth = 800, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensiona mantendo proporção
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    
                    // Melhora a qualidade do redimensionamento
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    ctx.drawImage(img, 0, 0, width, height);

                    // Converte para Base64 compactado
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    
                    console.log('📦 Imagem compactada:', {
                        original: (file.size / 1024).toFixed(2) + ' KB',
                        compressed: (compressedBase64.length * 0.75 / 1024).toFixed(2) + ' KB',
                        reduction: ((1 - (compressedBase64.length * 0.75 / file.size)) * 100).toFixed(1) + '%'
                    });

                    resolve(compressedBase64);
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Adiciona ou atualiza um produto
     */
    async saveProduct(product, imageFile = null) {
        if (!this.ready) await this.init();

        // Se tem imagem nova, compacta
        if (imageFile) {
            product.image = await this.compressImage(imageFile);
            product.imageSize = (product.image.length * 0.75 / 1024).toFixed(2) + ' KB';
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.PRODUCTS], 'readwrite');
            const store = transaction.objectStore(STORES.PRODUCTS);
            const request = store.put(product);

            request.onsuccess = () => {
                console.log('✅ Produto salvo:', product.name);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Erro ao salvar produto:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Busca todos os produtos
     */
    async getAllProducts() {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
            const store = transaction.objectStore(STORES.PRODUCTS);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(category) {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
            const store = transaction.objectStore(STORES.PRODUCTS);
            const index = store.index('category');
            const request = index.getAll(category);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Busca um produto por ID
     */
    async getProduct(id) {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.PRODUCTS], 'readonly');
            const store = transaction.objectStore(STORES.PRODUCTS);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deleta um produto
     */
    async deleteProduct(id) {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.PRODUCTS], 'readwrite');
            const store = transaction.objectStore(STORES.PRODUCTS);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('🗑️ Produto deletado:', id);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Salva informações de contato
     */
    async saveContact(contactData) {
        if (!this.ready) await this.init();

        contactData.id = 'main'; // ID fixo para contato principal

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.CONTACT], 'readwrite');
            const store = transaction.objectStore(STORES.CONTACT);
            const request = store.put(contactData);

            request.onsuccess = () => {
                console.log('✅ Contato salvo');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Busca informações de contato
     */
    async getContact() {
        if (!this.ready) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.CONTACT], 'readonly');
            const store = transaction.objectStore(STORES.CONTACT);
            const request = store.get('main');

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Migra dados do localStorage para IndexedDB
     */
    async migrateFromLocalStorage() {
        console.log('🔄 Migrando dados do localStorage...');

        // Migra produtos
        const oldProducts = localStorage.getItem('nyw_products');
        if (oldProducts) {
            try {
                const products = JSON.parse(oldProducts);
                for (const product of products) {
                    await this.saveProduct(product);
                }
                console.log(`✅ ${products.length} produtos migrados`);
                localStorage.removeItem('nyw_products');
            } catch (e) {
                console.error('Erro ao migrar produtos:', e);
            }
        }

        // Migra contato
        const oldContact = localStorage.getItem('nyw_contact');
        if (oldContact) {
            try {
                const contact = JSON.parse(oldContact);
                await this.saveContact(contact);
                console.log('✅ Contato migrado');
                localStorage.removeItem('nyw_contact');
            } catch (e) {
                console.error('Erro ao migrar contato:', e);
            }
        }
    }

    /**
     * Retorna estatísticas do banco
     */
    async getStats() {
        const products = await this.getAllProducts();
        const contact = await this.getContact();

        return {
            totalProducts: products.length,
            availableProducts: products.filter(p => p.status === 'available').length,
            unavailableProducts: products.filter(p => p.status === 'unavailable').length,
            hasContact: !!contact,
            categories: {
                pv: products.filter(p => p.category === 'pv').length,
                pp: products.filter(p => p.category === 'pp').length,
                piquet: products.filter(p => p.category === 'piquet').length,
                helanca: products.filter(p => p.category === 'helanca').length
            }
        };
    }
}

// Instância global
const dbManager = new DatabaseManager();

// Inicializa automaticamente
dbManager.init().then(() => {
    // Migra dados antigos se existirem
    dbManager.migrateFromLocalStorage();
});

// Exporta para uso global
window.DBManager = dbManager;