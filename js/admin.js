// ===== ADMIN.JS - Sistema de Gerenciamento NYW MALHAS (IndexedDB) =====

// Credenciais (EM PRODUÇÃO, USE BACKEND REAL!)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Produtos iniciais (para seed do banco)
const INITIAL_PRODUCTS = [
    // Malha PV
    { name: 'Malha PV Preta', category: 'pv', color: 'Preta', image: 'img/malha-pv-preta.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Bege', category: 'pv', color: 'Bege', image: 'img/malha-pv-bege.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Azul Royal', category: 'pv', color: 'Azul Royal', image: 'img/malha-pv-azul-royal.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Verde Musgo', category: 'pv', color: 'Verde Musgo', image: 'img/malha-pv-verde-musgo.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Cinza Mescla', category: 'pv', color: 'Cinza Mescla', image: 'img/malha-pv-cinza-mescla.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PV Vermelha', category: 'pv', color: 'Vermelha', image: 'img/malha-pv-vermelha.webp', status: 'available', price: 30.00, stock: 100 },

    // Malha PP
    { name: 'Malha PP Preta', category: 'pp', color: 'Preta', image: 'img/malha-pp-preta.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Vinho', category: 'pp', color: 'Vinho', image: 'img/malha-pp-vinho.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Branca', category: 'pp', color: 'Branca', image: 'img/malha-pp-branca.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Malha PP Azul Marinho', category: 'pp', color: 'Azul Marinho', image: 'img/malha-pp-azul-marinho.webp', status: 'available', price: 30.00, stock: 100 },

    // Piquet (Malha Piquet)
    { name: 'Piquet Azul Marinho', category: 'piquet', color: 'Azul Marinho', image: 'img/azul-marinho-piquet.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Vermelho', category: 'piquet', color: 'Vermelho', image: 'img/vermelho-piquet.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Cinza Chumbo', category: 'piquet', color: 'Cinza Chumbo', image: 'img/malha-piquet-pa-cinza-chumbo.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Verde Bandeira', category: 'piquet', color: 'Verde Bandeira', image: 'img/malha-piquet-pa-bandeira.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Branco', category: 'piquet', color: 'Branco', image: 'img/malha-piquet-branca.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Piquet Preto', category: 'piquet', color: 'Preto', image: 'img/malha-piquet-preta.webp', status: 'available', price: 30.00, stock: 100 },

    // Helanca Light
    { name: 'Helanca Light Preto', category: 'helanca', color: 'Preto', image: 'img/helanca-light-preto.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Bordô', category: 'helanca', color: 'Bordô', image: 'img/helanca-light-bordo.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Azul Royal', category: 'helanca', color: 'Azul Royal', image: 'img/helanca-light-azul-royal.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Light Rosa Pink', category: 'helanca', color: 'Rosa Pink', image: 'img/helanca-light-rosa-pink.webp', status: 'available', price: 30.00, stock: 100 },

    // Algodão 30.1
    { name: 'Meia Malha 30.1 Branco', category: 'algodao', color: 'Branco', image: 'img/algodao-branco.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Azul Marinho', category: 'algodao', color: 'Azul Marinho', image: 'img/algodao-azul-marinho.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Vermelho', category: 'algodao', color: 'Vermelho', image: 'img/algodao-vermelho.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Preto', category: 'algodao', color: 'Preto', image: 'img/algodao-preto.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Meia Malha 30.1 Cinza Claro', category: 'algodao', color: 'Cinza Claro', image: 'img/algodao-cinza-claro.webp', status: 'available', price: 30.00, stock: 100 },

    // Dry Fit
    { name: 'Dry Fit Preto', category: 'dryfit', color: 'Preto', image: 'img/dry-fit-preto.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Dry Fit Branco', category: 'dryfit', color: 'Branco', image: 'img/dry-fit-branco.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Dry Fit Azul Royal', category: 'dryfit', color: 'Azul Royal', image: 'img/dry-fit-azul-royal.webp', status: 'available', price: 30.00, stock: 100 },

    // Viscose
    { name: 'Viscose-Elastano Vermelha', category: 'viscose', color: 'Vermelha', image: 'img/viscose-vermelha.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Viscose-Elastano Cinza Mescla', category: 'viscose', color: 'Cinza Mescla', image: 'img/viscose-cinza-mescla.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Viscose-Elastano Vinho', category: 'viscose', color: 'Vinho', image: 'img/viscose-vinho.webp', status: 'available', price: 30.00, stock: 100 },

    // Moletom
    { name: 'Moletom Cinza Mescla', category: 'moletom', color: 'Cinza Mescla', image: 'img/moletom.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Moletom Azul Marinho', category: 'moletom', color: 'Azul Marinho', image: 'img/moletom-azul-marinho.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Moletom Bordô', category: 'moletom', color: 'Bordô', image: 'img/moletom-bordo.webp', status: 'available', price: 30.00, stock: 100 },

    // Helanca Escolar
    { name: 'Helanca Escolar Verde Bandeira', category: 'helanca-escolar', color: 'Verde Bandeira', image: 'img/helanca-escolar-verde-bandeira.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Escolar Cinza', category: 'helanca-escolar', color: 'Cinza', image: 'img/helanca-escolar-cinza.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Helanca Escolar Azul Marinho', category: 'helanca-escolar', color: 'Azul Marinho', image: 'img/helanca-escolar-marinho.webp', status: 'available', price: 30.00, stock: 100 },

    // Oxford
    { name: 'Oxford Cinza', category: 'oxford', color: 'Cinza', image: 'img/oxford-cinza.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Oxford Azul Marinho', category: 'oxford', color: 'Azul Marinho', image: 'img/oxford-azul-marinho.webp', status: 'available', price: 30.00, stock: 100 },
    { name: 'Oxford Vermelho', category: 'oxford', color: 'Vermelho', image: 'img/oxford-vermelho.webp', status: 'available', price: 30.00, stock: 100 }
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

document.addEventListener('DOMContentLoaded', async function () {
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

        // 1. Iniciar conexão
        await window.DBManager.init();

        // Atualizar indicador visual de servidor
        const badge = document.getElementById('serverStatusBadge');
        if (badge) {
            const isLocal = window.APIClient.baseURL.includes('localhost');
            const serverName = isLocal ? 'Servidor Local' : 'Nuvem (MongoDB Atlas)';
            badge.querySelector('span').textContent = serverName;
            badge.querySelector('i').style.color = '#2ecc71';
            badge.title = `API: ${window.APIClient.baseURL}`;
        }

        // 2. Carrega produtos e contato direto do servidor
        products = await window.DBManager.getAllProducts();
        contactInfo = await window.DBManager.getContact();

        if (!contactInfo) {
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
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin();
    });

    // Logout
    logoutBtn.addEventListener('click', function () {
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

    // Auto-refresh estatísticas a cada 30 segundos
    if (!window.adminStatsInterval) {
        window.adminStatsInterval = setInterval(async () => {
            if (document.getElementById('adminPanel').classList.contains('active')) {
                await updateStats();
            }
        }, 30000);
    }
}

// ===== ATUALIZAR ESTATÍSTICAS E DASHBOARD =====
async function updateStats() {
    // 1. Sempre carregar produtos antes de calcular estatísticas se o array estiver vazio
    if (!products || products.length === 0) {
        products = await window.DBManager.getAllProducts();
    }

    // 2. Calcular estatísticas locais (Estado atual) como base garantida
    const total = products.length;
    const available = products.filter(p => p.status === 'available').length;
    const unavailable = products.filter(p => p.status === 'unavailable' || (p.stock !== undefined && p.stock <= 0)).length;

    // Atualizar UI imediatamente com dados locais
    const totalEl = document.getElementById('totalProducts');
    const availableEl = document.getElementById('availableProducts');
    const unavailableEl = document.getElementById('unavailableProducts');

    if (totalEl) totalEl.textContent = total;
    if (availableEl) availableEl.textContent = available;
    if (unavailableEl) unavailableEl.textContent = unavailable;

    try {
        // 3. Tentar buscar dados consolidados da API (Analytics)
        if (window.APIClient) {
            const analytics = await window.APIClient.get('/analytics/overview');

            if (analytics && analytics.success) {
                const data = analytics.data;

                // Se a API trouxer números maiores/diferentes (ex: outros admins logados), atualiza
                if (data.products.total >= total) {
                    if (totalEl) totalEl.textContent = data.products.total;
                    if (availableEl) availableEl.textContent = data.products.available;
                    if (unavailableEl) unavailableEl.textContent = data.products.outOfStock;
                }

                // Cards Financeiros Desativados
                const revenueEl = document.getElementById('totalRevenue');
                if (revenueEl) revenueEl.style.display = 'none';

                // Atualizar Gráficos se houver dados
                if (data.products.total > 0) updateCharts(data);
            }
        }

        // Atualizar Notificações (Sino)
        updateNotificationsBadge();

    } catch (error) {
        console.warn('⚠️ Server Analytics indisponível. Usando contagem local.');
    }
}

// ===== GRÁFICOS (Chart.js) =====
let salesChart = null;
let productsChart = null;

function updateCharts(data) {
    // Se não tiver elemento canvas, não faz nada
    const ctxSales = document.getElementById('salesChart');
    const ctxProducts = document.getElementById('productsChart');

    if (!ctxSales || !ctxProducts) return;

    // Destruir gráficos anteriores se existirem
    if (salesChart) salesChart.destroy();
    if (productsChart) productsChart.destroy();

    // Gráfico de Estoque por Status (Exemplo)
    productsChart = new Chart(ctxProducts, {
        type: 'doughnut',
        data: {
            labels: ['Disponível', 'Sem Estoque', 'Baixo Estoque'],
            datasets: [{
                data: [data.products.available, data.products.outOfStock, data.products.lowStock],
                backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Para o gráfico de vendas, precisaríamos do histórico (que vem de outro endpoint), 
    // mas vamos por enquanto usar os totais gerais ou buscar timeline
    fetchStockTimeline(ctxSales);
}

async function fetchStockTimeline(canvas) {
    try {
        if (!window.APIClient) return;
        const json = await window.APIClient.get('/analytics/stock-timeline?days=7');

        if (json.success) {
            const labels = json.data.map(d => `${d._id.day}/${d._id.month}`);
            const dataAdded = json.data.map(d => d.stockAdded);
            const dataRemoved = json.data.map(d => d.stockRemoved);

            salesChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Entrada de Estoque',
                            data: dataAdded,
                            backgroundColor: '#2ecc71',
                            borderRadius: 4
                        },
                        {
                            label: 'Saída/Vendas',
                            data: dataRemoved,
                            backgroundColor: '#e74c3c',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    } catch (e) {
        console.error('Erro chart timeline:', e);
    }
}

// ===== NOTIFICAÇÕES (Sino) =====
async function updateNotificationsBadge() {
    try {
        if (!window.APIClient) return;
        const json = await window.APIClient.get('/notifications');

        if (json && json.success) {
            const unreadCount = json.data.filter(n => !n.read).length;
            const badge = document.getElementById('notification-badge'); // Corrigido selector para ID
            const icon = document.querySelector('.fa-bell');

            if (badge) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }

            // Tornar o sino clicável para abrir a nova página
            if (icon && icon.parentElement) {
                icon.parentElement.style.cursor = 'pointer';
                icon.parentElement.onclick = () => window.location.href = 'admin-notifications.html';
                icon.parentElement.title = "Ver todas as notificações";
            }
        }
    } catch (e) { console.error(e); }
}

// ===== RENDERIZAR LINHA DE PRODUTO (MODULAR) =====
function renderProductRow(product) {
    const productId = product._id || product.id;
    return `
        <td>
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22%3ESem Imagem%3C/text%3E%3C/svg%3E'">
        </td>
        <td>${product.name}</td>
        <td>${getCategoryName(product.category)}</td>
        <td>${product.color}</td>
        <td style="font-weight: 600;">${product.stock || 0}</td>
        <td>
            <span class="status-badge ${product.status}">
                ${product.status === 'available' ? 'Disponível' : 'Indisponível'}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-toggle" onclick="toggleStatus('${productId}')">
                    <i class="fas fa-exchange-alt"></i> Status
                </button>
                <button class="btn-edit" onclick="editProduct('${productId}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteProduct('${productId}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </td>
    `;
}

// ===== CARREGAR PRODUTOS NA TABELA =====
async function loadProducts() {
    products = await window.DBManager.getAllProducts();

    const tbody = document.getElementById('productsTableBody');
    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const row = document.createElement('tr');
        row.id = `row-${product._id || product.id}`;
        row.innerHTML = renderProductRow(product);
        fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

// ===== NOME DA CATEGORIA =====
function getCategoryName(category) {
    const categories = {
        pv: 'Malha PV',
        pp: 'Malha PP',
        piquet: 'Malha Piquet',
        helanca: 'Helanca Light',
        algodao: 'Algodão Penteado',
        dryfit: 'Dry Fit',
        viscose: 'Viscose',
        moletom: 'Moletom',
        oxford: 'Oxford',
        'helanca-escolar': 'Helanca Escolar'
    };
    return categories[category] || category;
}

// ===== TOGGLE STATUS =====
async function toggleStatus(id) {
    try {
        // Busca o produto na lista carregada (referência direta)
        const index = products.findIndex(p => (p._id || p.id) === id);
        const product = products[index];

        if (product) {
            // 1. Mudança Otimista (UI local primeiro)
            const oldStatus = product.status;
            product.status = oldStatus === 'available' ? 'unavailable' : 'available';

            // Atualiza apenas a linha específica imediatamente
            const row = document.getElementById(`row-${id}`);
            if (row) {
                row.innerHTML = renderProductRow(product);
            }

            // 2. Salva no banco em background
            // Atualizamos a referência no array com o que voltar do servidor
            const updatedProduct = await window.DBManager.saveProduct(product);
            if (updatedProduct) {
                products[index] = updatedProduct;
            }

            // 3. Atualiza estatísticas
            updateStats();

            showNotification('Status atualizado!', 'success');
        } else {
            showNotification('Produto não encontrado!', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao salvar. Verificando conexão...', 'error');
        // Recarrega tudo se houver erro crítico de persistência
        await loadProducts();
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
        document.getElementById('productStock').value = product.stock || 0;
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

    addBtn.addEventListener('click', function () {
        currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Adicionar Produto';
        productForm.reset();
        document.getElementById('imagePreview').classList.remove('show');
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    productForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleProductSubmit();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', function (e) {
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

    fileUpload.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
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
    const stock = parseInt(document.getElementById('productStock').value) || 0;

    // Pegar status do dropdown
    let status = document.getElementById('productStatus').value;

    // Regra de segurança: se estoque for 0, forçar indisponível
    if (stock <= 0) {
        status = 'unavailable';
    }

    const imageFile = document.getElementById('productImage').files[0];
    const loadingOverlay = document.getElementById('loadingOverlay');

    try {
        // Mostrar animação se houver imagem para processar
        if (imageFile) {
            loadingOverlay.classList.add('active');
        }

        if (currentEditId) {
            // Atualizar produto existente na lista e no banco
            const index = products.findIndex(p => (p._id || p.id) === currentEditId);
            if (index !== -1) {
                const product = products[index];
                product.name = name;
                product.category = category;
                product.color = color;
                product.stock = stock;
                product.status = status;

                // Salva e atualiza com o retorno do servidor
                const updated = await window.DBManager.saveProduct(product, imageFile);
                if (updated) {
                    products[index] = updated;
                }

                // Atualiza a linha local imediatamente com os dados finais
                const row = document.getElementById(`row-${currentEditId}`);
                if (row) {
                    row.innerHTML = renderProductRow(products[index]);
                }

                showNotification('Produto atualizado!', 'success');
            }
        } else {
            // Adicionar novo produto
            const newProduct = {
                name, category, color, stock, status,
                image: 'img/placeholder.webp'
            };

            await window.DBManager.saveProduct(newProduct, imageFile);
            await loadProducts(); // Recarrega tudo para novos itens
            showNotification('Produto adicionado!', 'success');
        }

        updateStats();
        document.getElementById('productModal').classList.remove('active');
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar: ' + error.message, 'error');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
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

    editBtn.addEventListener('click', function () {
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

    closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleContactSubmit();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', function (e) {
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

