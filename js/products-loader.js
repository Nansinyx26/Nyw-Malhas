/**
 * Products Loader - Sistema de gerenciamento de produtos
 * Carrega produtos do IndexedDB com auto-refresh SUAVE (sem piscar)
 */

// Variável global para controlar recarregamento
let productsLoadInterval = null;

/**
 * Carrega os produtos na página atual (SEM PISCAR)
 */
async function loadProducts(forceReload = false) {
    const currentPage = getCurrentPage();

    if (!currentPage) {
        console.warn('Página não reconhecida');
        return;
    }

    const productsGrid = document.querySelector('.products-grid');

    if (!productsGrid) {
        console.warn('Container .products-grid não encontrado');
        return;
    }

    if (!window.DBManager) {
        console.error('DBManager não está disponível');
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--primary); opacity: 0.5; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Erro ao carregar</h3>
                <p style="color: var(--text-secondary);">Sistema de banco de dados não disponível.</p>
            </div>
        `;
        return;
    }

    try {
        // Aguarda o DB estar pronto
        if (!window.DBManager.ready) {
            await window.DBManager.init();
        }

        // Busca produtos do IndexedDB
        const allProductsFromDB = await window.DBManager.getProductsByCategory(currentPage);
        
        let allProducts = [];
        
        if (allProductsFromDB && allProductsFromDB.length > 0) {
            allProducts = allProductsFromDB;
        } else {
            console.warn('⚠️ Nenhum produto encontrado no banco. Usando produtos padrão.');
            allProducts = getDefaultProducts(currentPage);
        }

        // ✅ NOVA LÓGICA: Atualiza apenas se necessário
        const existingCards = productsGrid.querySelectorAll('.product-card');
        
        // Se não há cards OU é forceReload, renderiza tudo
        if (existingCards.length === 0 || forceReload) {
            productsGrid.innerHTML = '';
            
            if (allProducts.length === 0) {
                productsGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                        <i class="fas fa-box-open" style="font-size: 4rem; color: var(--primary); opacity: 0.5; margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--text-primary);">Nenhum produto cadastrado</h3>
                        <p style="color: var(--text-secondary);">Em breve teremos novidades!</p>
                    </div>
                `;
                return;
            }

            allProducts.forEach(produto => {
                const card = createProductCard(produto);
                productsGrid.appendChild(card);
                
                // Marca como carregado após um frame para permitir a animação inicial
                setTimeout(() => {
                    card.classList.add('loaded');
                }, 600);
            });
            
            console.log(`✅ ${allProducts.length} produto(s) carregado(s)`);
        } else {
            // ✅ Atualiza apenas o status dos produtos existentes
            updateProductsStatus(allProducts);
        }

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #e74c3c; opacity: 0.5; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Erro ao carregar produtos</h3>
                <p style="color: var(--text-secondary);">Por favor, tente novamente mais tarde.</p>
            </div>
        `;
    }
}

/**
 * ✅ NOVA FUNÇÃO: Atualiza apenas o status sem recriar os cards
 */
function updateProductsStatus(products) {
    products.forEach(produto => {
        const card = document.querySelector(`[data-product-id="${produto.id}"]`);
        if (!card) return;

        const availabilityEl = card.querySelector('.availability');
        if (!availabilityEl) return;

        const isAvailable = produto.status === 'available';
        const newStatusClass = isAvailable ? 'available' : 'unavailable';
        const newStatusIcon = isAvailable ? 'fa-check-circle' : 'fa-times-circle';
        const newStatusText = isAvailable ? 'Disponível' : 'Indisponível';

        // Só atualiza se o status mudou
        if (!availabilityEl.classList.contains(newStatusClass)) {
            // Adiciona transição suave
            availabilityEl.style.transition = 'all 0.3s ease';
            
            // Remove classes antigas
            availabilityEl.classList.remove('available', 'unavailable');
            
            // Adiciona nova classe
            availabilityEl.classList.add(newStatusClass);
            
            // Atualiza ícone e texto
            availabilityEl.innerHTML = `
                <i class="fas ${newStatusIcon}"></i> ${newStatusText}
            `;
            
            console.log(`🔄 Status atualizado: ${produto.name} → ${newStatusText}`);
        }
    });
}

/**
 * Cria um card de produto com status dinâmico
 */
function createProductCard(produto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', getCategoryClass(produto));
    card.setAttribute('data-product-id', produto.id);

    const isAvailable = produto.status === 'available';
    const statusIcon = isAvailable ? 'fa-check-circle' : 'fa-times-circle';
    const statusText = isAvailable ? 'Disponível' : 'Indisponível';
    const statusClass = isAvailable ? 'available' : 'unavailable';

    let imagePath = produto.image || '';
    
    if (imagePath && !imagePath.startsWith('../') && !imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
        imagePath = '../img/' + imagePath.split('/').pop();
    }

    card.innerHTML = `
        <div class="card-image" style="background-image: url('${imagePath}');">
            <div class="card-overlay">
                <button class="view-details">
                    <i class="fas fa-search-plus"></i> Ver Detalhes
                </button>
            </div>
        </div>
        <div class="card-content">
            <h3>${produto.name}</h3>
            <div class="card-specs">
                <span class="spec-badge">
                    <i class="fas fa-flask"></i> ${getComposicao(produto.category)}
                </span>
                <span class="spec-badge">
                    <i class="fas fa-weight"></i> ${getGramatura(produto.category)}
                </span>
            </div>
            <p class="card-description">${getDescricao(produto)}</p>
            <div class="card-footer">
                <span class="color-indicator" style="background: ${getColorGradient(produto.color)};"></span>
                <span class="availability ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${statusText}
                </span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Detecta qual página estamos baseado no URL
 */
function getCurrentPage() {
    const url = window.location.pathname;

    if (url.includes('malha-pv')) return 'pv';
    if (url.includes('malha-pp')) return 'pp';
    if (url.includes('malha-piquet') || url.includes('piquet')) return 'piquet';
    if (url.includes('helanca')) return 'helanca';

    return null;
}

/**
 * Retorna categoria CSS baseada na cor
 */
function getCategoryClass(produto) {
    const darkColors = ['preta', 'preto', 'azul', 'marinho', 'vinho', 'bordô', 'chumbo'];
    const lightColors = ['bege', 'branco', 'vermelho', 'amarelo'];
    
    const colorLower = produto.color.toLowerCase();
    
    if (darkColors.some(c => colorLower.includes(c))) return 'escura';
    if (lightColors.some(c => colorLower.includes(c))) return 'clara';
    if (colorLower.includes('bandeira')) return 'especial';
    
    return 'mescla';
}

function getComposicao(category) {
    const composicoes = {
        pv: '96% PES / 4% EL',
        pp: '100% Poliéster',
        piquet: 'Poliamida ou 96% PES / 4% EL',
        helanca: '92% PA / 8% EL'
    };
    return composicoes[category] || 'N/A';
}

function getGramatura(category) {
    const gramaturas = {
        pv: '160 g/m²',
        pp: '150 g/m²',
        piquet: '180 g/m²',
        helanca: '220 g/m²'
    };
    return gramaturas[category] || 'N/A';
}

function getDescricao(produto) {
    if (produto.description) return produto.description;
    
    const descricoes = {
        pv: 'Ideal para uniformes corporativos e esportivos. Alta durabilidade e conforto.',
        pp: 'Ideal para uniformes e peças do dia a dia. Resistente e durável.',
        piquet: 'Textura clássica e elegante para peças de qualidade superior.',
        helanca: 'Elasticidade superior e conforto máximo para roupas fitness e esportivas.'
    };
    
    return descricoes[produto.category] || 'Tecido de alta qualidade.';
}

function getColorGradient(color) {
    const colorLower = color.toLowerCase();
    
    const gradients = {
        'preta': 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        'preto': 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        'bege': 'linear-gradient(135deg, #f5f5dc 0%, #d2b48c 100%)',
        'azul royal': 'linear-gradient(135deg, #4169e1 0%, #0047ab 100%)',
        'azul marinho': 'linear-gradient(135deg, #001f3f 0%, #000814 100%)',
        'verde musgo': 'linear-gradient(135deg, #8b9556 0%, #556b2f 100%)',
        'vinho': 'linear-gradient(135deg, #722f37 0%, #4a1f26 100%)',
        'bordô': 'linear-gradient(135deg, #800020 0%, #5c0017 100%)',
        'cinza chumbo': 'linear-gradient(135deg, #54626f 0%, #2f3640 100%)',
        'vermelho': 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        'bandeira': 'linear-gradient(135deg, #003893 0%, #009c3b 50%, #ffdf00 100%)'
    };
    
    return gradients[colorLower] || 'linear-gradient(135deg, #666 0%, #333 100%)';
}

function getDefaultProducts(category) {
    const defaults = {
        pv: [
            { id: 1, name: 'Malha PV Preta', category: 'pv', color: 'Preta', image: '../img/malha-pv-preta.jpg', status: 'available' },
            { id: 2, name: 'Malha PV Bege', category: 'pv', color: 'Bege', image: '../img/malha-pv-bege.jpg', status: 'available' },
            { id: 3, name: 'Malha PV Azul Royal', category: 'pv', color: 'Azul Royal', image: '../img/malha-pv-azul-royal.jpg', status: 'available' },
            { id: 4, name: 'Malha PV Verde Musgo', category: 'pv', color: 'Verde Musgo', image: '../img/malha-pv-verde-musgo.jpg', status: 'available' }
        ],
        pp: [
            { id: 6, name: 'Malha PP Preta', category: 'pp', color: 'Preta', image: '../img/malha-pp-preta.jpg', status: 'available' },
            { id: 7, name: 'Malha PP Vinho', category: 'pp', color: 'Vinho', image: '../img/malha-pp-vinho.jpg', status: 'available' }
        ],
        piquet: [
            { id: 8, name: 'Piquet PA Bandeira', category: 'piquet', color: 'Bandeira', image: '../img/malha-piquet-pa-bandeira.jpg', status: 'available' },
            { id: 9, name: 'Piquet PA Cinza Chumbo', category: 'piquet', color: 'Cinza Chumbo', image: '../img/malha-piquet-pa-cinza-chumbo.jpg', status: 'available' }
        ],
        helanca: [
            { id: 12, name: 'Helanca Light Preto', category: 'helanca', color: 'Preto', image: '../img/helanca-light-preto.jpg', status: 'available' },
            { id: 13, name: 'Helanca Light Bordô', category: 'helanca', color: 'Bordô', image: '../img/helanca-light-bordo.jpg', status: 'available' }
        ]
    };
    
    return defaults[category] || [];
}

/**
 * Sistema de auto-refresh (SEM PISCAR)
 */
function startAutoRefresh() {
    // Limpa intervalo anterior se existir
    if (productsLoadInterval) {
        clearInterval(productsLoadInterval);
    }

    // Recarrega produtos a cada 3 segundos (apenas status)
    productsLoadInterval = setInterval(async () => {
        await loadProducts(false); // false = não força reload completo
    }, 3000);

    console.log('✅ Auto-refresh ativado (3 segundos) - Modo Suave');
}

/**
 * Para o auto-refresh quando necessário
 */
function stopAutoRefresh() {
    if (productsLoadInterval) {
        clearInterval(productsLoadInterval);
        productsLoadInterval = null;
        console.log('⏸️ Auto-refresh pausado');
    }
}

async function initProductsLoader() {
    if (window.DBManager) {
        try {
            await window.DBManager.init();
            await loadProducts(true); // true = carregamento inicial completo
            
            // Inicia auto-refresh após o carregamento inicial
            startAutoRefresh();
        } catch (error) {
            console.error('Erro ao inicializar produtos:', error);
        }
    } else {
        console.error('DBManager não encontrado');
    }
}

// Executa quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsLoader);
} else {
    initProductsLoader();
}

// Para o auto-refresh quando a página é fechada
window.addEventListener('beforeunload', stopAutoRefresh);

// Exporta para uso externo
window.ProductsLoader = {
    reload: loadProducts,
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh
};