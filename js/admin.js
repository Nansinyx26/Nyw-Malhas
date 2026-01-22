// ===== ADMIN.JS - Sistema de Gerenciamento NYW MALHAS (IndexedDB) =====

// Credenciais (EM PRODUÇÃO, USE BACKEND REAL!)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Produtos iniciais (para seed do banco)
const INITIAL_PRODUCTS = [{
        name: 'Malha PV Preta',
        category: 'pv',
        color: 'Preta',
        image: 'img/malha-pv-preta.jpg',
        status: 'available'
    },
    {
        name: 'Malha PV Bege',
        category: 'pv',
        color: 'Bege',
        image: 'img/malha-pv-bege.jpg',
        status: 'available'
    },
    {
        name: 'Malha PV Azul Royal',
        category: 'pv',
        color: 'Azul Royal',
        image: 'img/malha-pv-azul-royal.jpg',
        status: 'available'
    },
    {
        name: 'Malha PV Verde Musgo',
        category: 'pv',
        color: 'Verde Musgo',
        image: 'img/malha-pv-verde-musgo.jpg',
        status: 'available'
    },
    {
        name: 'Malha PP Preta',
        category: 'pp',
        color: 'Preta',
        image: 'img/malha-pp-preta.jpg',
        status: 'available'
    },
    {
        name: 'Malha PP Vinho',
        category: 'pp',
        color: 'Vinho',
        image: 'img/malha-pp-vinho.jpg',
        status: 'available'
    },
    {
        name: 'Piquet PA Bandeira',
        category: 'piquet',
        color: 'Bandeira',
        image: 'img/malha-piquet-pa-bandeira.jpg',
        status: 'available'
    },
    {
        name: 'Piquet PA Cinza Chumbo',
        category: 'piquet',
        color: 'Cinza Chumbo',
        image: 'img/malha-piquet-pa-cinza-chumbo.jpg',
        status: 'available'
    },
    {
        name: 'Helanca Light Preto',
        category: 'helanca',
        color: 'Preto',
        image: 'img/helanca-light-preto.jpg',
        status: 'available'
    },
    {
        name: 'Helanca Light Bordô',
        category: 'helanca',
        color: 'Bordô',
        image: 'img/helanca-light-bordo.jpg',
        status: 'available'
    }
];

// Dados de contato iniciais
const INITIAL_CONTACT = {
    email: 'contato@nywmalhas.com.br',
    phone: '(XX) XXXX-XXXX',
    whatsapp: '+55 XX XXXXX-XXXX',
    address: '[Seu endereço completo]',
    hours: 'Segunda a Sexta, 08:00 às 18:00',
    facebook: 'https://facebook.com/nywmalhas',
    instagram: '@nywmalhas'
};

// Estado atual
let currentEditId = null;
let products = [];
let contactInfo = {};

document.addEventListener('DOMContentLoaded', async function() {
    // Aguarda o DBManager estar pronto
    if (!window.DBManager) {
        console.error('DBManager não encontrado!');
        alert('Erro: Sistema de banco de dados não disponível.');
        return;
    }

    try {
        await window.DBManager.init();
        
        // Carrega produtos do IndexedDB
        products = await window.DBManager.getAllProducts();
        
        // Se não há produtos, faz seed inicial
        if (products.length === 0) {
            console.log('📦 Iniciando banco com produtos padrão...');
            for (const product of INITIAL_PRODUCTS) {
                await window.DBManager.saveProduct(product);
            }
            products = await window.DBManager.getAllProducts();
        }

        // Carrega informações de contato
        contactInfo = await window.DBManager.getContact();
        if (!contactInfo) {
            console.log('📞 Iniciando contato padrão...');
            await window.DBManager.saveContact(INITIAL_CONTACT);
            contactInfo = await window.DBManager.getContact();
        }

        initializeApp();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        alert('Erro ao inicializar sistema: ' + error.message);
    }
});

// ===== INICIALIZAÇÃO =====
function initializeApp() {
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Verificar se já está logado
    const isLogged = sessionStorage.getItem('admin_logged');
    if (isLogged === 'true') {
        showAdminPanel();
    }

    // Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        handleLogout();
    });

    // Modal handlers
    setupModalHandlers();
    setupContactModal();

    // File upload handler
    setupFileUpload();
}

// ===== LOGIN =====
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('loginError');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('admin_logged', 'true');
        errorMessage.classList.remove('show');
        showAdminPanel();
    } else {
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}

// ===== LOGOUT =====
function handleLogout() {
    sessionStorage.removeItem('admin_logged');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// ===== MOSTRAR PAINEL =====
async function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');
    await loadProducts();
    loadContactInfo();
    await updateStats();
}

// ===== ATUALIZAR ESTATÍSTICAS =====
async function updateStats() {
    const stats = await window.DBManager.getStats();
    
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('availableProducts').textContent = stats.availableProducts;
    document.getElementById('unavailableProducts').textContent = stats.unavailableProducts;
}

// ===== CARREGAR PRODUTOS NA TABELA =====
async function loadProducts() {
    products = await window.DBManager.getAllProducts();
    
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22%3ESem Imagem%3C/text%3E%3C/svg%3E'">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.color}</td>
            <td>
                <span class="status-badge ${product.status}">
                    ${product.status === 'available' ? 'Disponível' : 'Indisponível'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-toggle" onclick="toggleStatus(${product.id})">
                        <i class="fas fa-exchange-alt"></i> Status
                    </button>
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== NOME DA CATEGORIA =====
function getCategoryName(category) {
    const categories = {
        pv: 'Malha PV',
        pp: 'Malha PP',
        piquet: 'Malha Piquet',
        helanca: 'Helanca Light',
        algodao: 'Algodão Penteado'
    };
    return categories[category] || category;
}

// ===== TOGGLE STATUS =====
async function toggleStatus(id) {
    try {
        // Busca o produto na lista carregada
        const product = products.find(p => p.id === id);
        if (product) {
            product.status = product.status === 'available' ? 'unavailable' : 'available';
            await window.DBManager.saveProduct(product);
            await loadProducts();
            await updateStats();
            showNotification('Status atualizado com sucesso!', 'success');
        } else {
            showNotification('Produto não encontrado!', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao atualizar status: ' + error.message, 'error');
    }
}

// ===== EDITAR PRODUTO =====
async function editProduct(id) {
    const product = await window.DBManager.getProduct(id);
    if (product) {
        currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Editar Produto';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productColor').value = product.color;
        document.getElementById('productStatus').value = product.status;

        // Mostrar preview da imagem atual
        const preview = document.getElementById('imagePreview');
        preview.src = product.image;
        preview.classList.add('show');

        document.getElementById('productModal').classList.add('active');
    }
}

// ===== DELETAR PRODUTO =====
async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        await window.DBManager.deleteProduct(id);
        await loadProducts();
        await updateStats();
        showNotification('Produto excluído com sucesso!', 'success');
    }
}

// ===== SETUP MODAL =====
function setupModalHandlers() {
    const addBtn = document.getElementById('addProductBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const modal = document.getElementById('productModal');

    addBtn.addEventListener('click', function() {
        currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Adicionar Produto';
        productForm.reset();
        document.getElementById('imagePreview').classList.remove('show');
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleProductSubmit();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ===== SETUP FILE UPLOAD =====
function setupFileUpload() {
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');

    fileUpload.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    });
}

// ===== SALVAR/ATUALIZAR PRODUTO =====
async function handleProductSubmit() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const color = document.getElementById('productColor').value;
    const status = document.getElementById('productStatus').value;
    const imageFile = document.getElementById('productImage').files[0];

    try {
        if (currentEditId) {
            // Atualizar produto existente
            const product = await window.DBManager.getProduct(currentEditId);
            if (product) {
                product.name = name;
                product.category = category;
                product.color = color;
                product.status = status;

                // Se nova imagem foi selecionada, usa compressão do DBManager
                await window.DBManager.saveProduct(product, imageFile);

                showNotification('Produto atualizado com sucesso!', 'success');
            }
        } else {
            // Adicionar novo produto
            const newProduct = {
                name: name,
                category: category,
                color: color,
                status: status,
                image: 'img/placeholder.jpg'
            };

            // Salva com compressão automática de imagem
            await window.DBManager.saveProduct(newProduct, imageFile);
            showNotification('Produto adicionado com sucesso!', 'success');
        }

        await loadProducts();
        await updateStats();
        document.getElementById('productModal').classList.remove('active');
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar produto: ' + error.message, 'error');
    }
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'success') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.toggleStatus = toggleStatus;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// ===== GERENCIAR INFORMAÇÕES DE CONTATO =====

function loadContactInfo() {
    if (!contactInfo) return;
    
    document.getElementById('displayEmail').textContent = contactInfo.email;
    document.getElementById('displayPhone').textContent = contactInfo.phone;
    document.getElementById('displayWhatsapp').textContent = contactInfo.whatsapp;
    document.getElementById('displayAddress').textContent = contactInfo.address;
    document.getElementById('displayHours').textContent = contactInfo.hours;
    document.getElementById('displayFacebook').textContent = contactInfo.facebook;
    document.getElementById('displayInstagram').textContent = contactInfo.instagram;
}

function setupContactModal() {
    const editBtn = document.getElementById('editContactBtn');
    const closeBtn = document.getElementById('closeContactModal');
    const cancelBtn = document.getElementById('cancelContactBtn');
    const contactForm = document.getElementById('contactForm');
    const modal = document.getElementById('contactModal');

    editBtn.addEventListener('click', function() {
        // Preencher formulário com dados atuais
        document.getElementById('contactEmail').value = contactInfo.email || '';
        document.getElementById('contactPhone').value = contactInfo.phone || '';
        document.getElementById('contactWhatsapp').value = contactInfo.whatsapp || '';
        document.getElementById('contactAddress').value = contactInfo.address || '';
        document.getElementById('contactHours').value = contactInfo.hours || '';
        document.getElementById('contactFacebook').value = contactInfo.facebook || '';
        document.getElementById('contactInstagram').value = contactInfo.instagram || '';

        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactSubmit();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

async function handleContactSubmit() {
    try {
        // Atualizar informações
        contactInfo = {
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            whatsapp: document.getElementById('contactWhatsapp').value,
            address: document.getElementById('contactAddress').value,
            hours: document.getElementById('contactHours').value,
            facebook: document.getElementById('contactFacebook').value,
            instagram: document.getElementById('contactInstagram').value
        };

        // Salvar no IndexedDB
        await window.DBManager.saveContact(contactInfo);

        // Atualizar exibição
        loadContactInfo();

        // Fechar modal
        document.getElementById('contactModal').classList.remove('active');

        // Notificação
        showNotification('Informações de contato atualizadas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar contato:', error);
        showNotification('Erro ao salvar contato: ' + error.message, 'error');
    }
}