/**
 * Products Sync v4 - Sincronização em Tempo Real com MongoDB
 * Sincroniza status de disponibilidade baseado no estoque do MongoDB
 */

let lastProductsHash = '';

async function syncProductsFromMongoDB() {
    if (!window.DBManager) {
        console.warn('DBManager não disponível');
        return;
    }

    try {
        if (!window.DBManager.ready) {
            await window.DBManager.init();
        }

        // Busca todos os produtos do MongoDB
        const allProducts = await window.DBManager.getAllProducts();

        if (!allProducts || allProducts.length === 0) {
            console.warn('Nenhum produto encontrado no MongoDB');
            return;
        }

        // Cria mapeamentos para busca rápida
        const productsByCategory = {};
        const productsByCatColor = {};

        allProducts.forEach(p => {
            const catKey = p.category.toLowerCase().trim();
            const colorKey = p.color.toLowerCase().trim();

            // Armazena por categoria e cor
            productsByCatColor[`${catKey}|${colorKey}`] = p;

            // Armazena primeiro disponível de cada categoria
            if (!productsByCategory[catKey] || productsByCategory[catKey].stock <= 0) {
                productsByCategory[catKey] = p;
            }
        });

        // ====== SINCRONIZA SEÇÕES DE PRODUTOS NO INDEX.HTML ======
        syncProductSections(allProducts, productsByCategory, productsByCatColor);

    } catch (error) {
        console.error('❌ Erro ao sincronizar produtos:', error);
    }
}

/**
 * Sincroniza as seções de produtos (Helanca, Dry Fit, Viscose, etc.)
 */
function syncProductSections(allProducts, productsByCategory, productsByCatColor) {
    // Mapeamento de seções
    const sections = {
        'helanca': ['helanca', 'helanca-escolar'],
        'algodao': ['algodao', 'meia-malha'],
        'helanca-escolar': ['helanca-escolar'],
        'dry-fit': ['dryfit'],
        'viscose': ['viscose'],
        'moletom': ['moletom'],
        'oxford': ['oxford']
    };

    Object.keys(sections).forEach(sectionId => {
        const section = document.getElementById(`section-${sectionId}`);
        if (!section) return;

        // Busca o container de informações dp produto
        const productInfo = section.querySelector('.product-info');
        if (!productInfo) return;

        // Encontra ou cria área de status
        let statusContainer = productInfo.querySelector('.product-status-indicator');

        if (!statusContainer) {
            // Cria o container de status se não existir
            statusContainer = document.createElement('div');
            statusContainer.className = 'product-status-indicator mb-3';

            // Insere antes do seletor de cor
            const colorSelector = productInfo.querySelector('.color-selector');
            if (colorSelector) {
                colorSelector.parentNode.insertBefore(statusContainer, colorSelector);
            } else {
                productInfo.insertBefore(statusContainer, productInfo.firstChild);
            }
        }

        // Busca produtos desta seção
        const categoriesForSection = sections[sectionId];
        let hasAvailableStock = false;
        let totalStock = 0;

        categoriesForSection.forEach(cat => {
            const productsInCat = allProducts.filter(p => p.category.toLowerCase() === cat.toLowerCase());
            productsInCat.forEach(p => {
                totalStock += (p.stock || 0);
                if ((p.stock || 0) > 0) hasAvailableStock = true;
            });
        });

        // Atualiza o indicador visual
        const isAvailable = totalStock > 0 && hasAvailableStock;
        const statusClass = isAvailable ? 'available' : 'unavailable';
        const statusIcon = isAvailable ? 'fa-check-circle' : 'fa-times-circle';
        const statusText = isAvailable ? 'Disponível' : 'Indisponível';
        const statusColor = isAvailable ? '#27ae60' : '#e74c3c';

        statusContainer.innerHTML = `
            <div class="availability-badge ${statusClass}" style="
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                background: ${isAvailable ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
                border: 2px solid ${statusColor};
                border-radius: 12px;
                color: ${statusColor};
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 1rem;
            ">
                <i class="fas ${statusIcon}" style="font-size: 1.3rem;"></i>
                <span>${statusText}</span>
                ${totalStock > 0 ? `<small style="opacity: 0.8; font-size: 0.9rem;">(${totalStock} em estoque)</small>` : ''}
            </div>
        `;

        // Desabilita botão se não disponível
        const orderButton = section.querySelector('.order-cta button, .btn-orange');
        if (orderButton) {
            if (!isAvailable) {
                orderButton.disabled = true;
                orderButton.style.opacity = '0.5';
                orderButton.style.cursor = 'not-allowed';
                orderButton.innerHTML = '<i class="fas fa-times-circle me-2"></i> PRODUTO INDISPONÍVEL';
            } else {
                orderButton.disabled = false;
                orderButton.style.opacity = '1';
                orderButton.style.cursor = 'pointer';
                const productName = section.querySelector('.section-header h1')?.textContent || 'Produto';
                orderButton.innerHTML = `<i class="fas fa-shopping-cart me-2"></i> FAZER PEDIDO AGORA`;
            }
        }

        console.log(`🔄 Seção ${sectionId}: ${statusText} (Estoque: ${totalStock})`);
    });

    // Sincroniza também os cards de cores individuais se existirem
    syncColorOptions(allProducts, productsByCatColor);
}

/**
 * Sincroniza opções de cores dentro de cada seção
 */
function syncColorOptions(allProducts, productsByCatColor) {
    const colorOptions = document.querySelectorAll('.color-option input[type="radio"]');

    colorOptions.forEach(option => {
        const colorName = option.dataset.color;
        const radioName = option.name; // helanca, dry-fit, viscose, etc.

        if (!colorName || !radioName) return;

        // Normaliza o nome da categoria
        let category = radioName.toLowerCase().replace('-', '');
        if (category === 'dryfit') category = 'dryfit';
        if (category === 'helancaescolar') category = 'helanca-escolar';

        // Busca o produto correspondente
        const productKey = `${category}|${colorName.toLowerCase()}`;
        const product = productsByCatColor[productKey];

        const label = option.closest('.color-option');
        if (!label) return;

        // Adiciona ou atualiza badge de status na opção de cor
        let badge = label.querySelector('.color-stock-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'color-stock-badge';
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                font-size: 0.65rem;
                padding: 0.2rem 0.4rem;
                border-radius: 8px;
                font-weight: 600;
                z-index: 10;
            `;
            label.style.position = 'relative';
            label.appendChild(badge);
        }

        if (product && product.stock > 0) {
            badge.style.background = '#27ae60';
            badge.style.color = 'white';
            badge.textContent = `${product.stock}`;
            badge.style.display = 'block';
            option.disabled = false;
            label.style.opacity = '1';
        } else {
            badge.style.background = '#e74c3c';
            badge.style.color = 'white';
            badge.textContent = '0';
            badge.style.display = 'block';
            option.disabled = true;
            label.style.opacity = '0.5';
            label.style.cursor = 'not-allowed';
        }
    });
}

// ====== INICIALIZAÇÃO E AUTO-REFRESH ======
let syncInterval = null;

function startProductSync() {
    // Sincronização inicial
    syncProductsFromMongoDB();

    // Limpa intervalo anterior se existir
    if (syncInterval) {
        clearInterval(syncInterval);
    }

    // Sincroniza a cada 2 segundos
    syncInterval = setInterval(() => {
        syncProductsFromMongoDB();
    }, 2000);

    console.log('✅ Sincronização de produtos ativada (2 segundos)');
}

function stopProductSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏸️ Sincronização de produtos pausada');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    startProductSync();
});

// Força execução caso DOM já carregado
if (document.readyState !== 'loading') {
    startProductSync();
}

// Para a sincronização quando a página é fechada
window.addEventListener('beforeunload', stopProductSync);

// Exporta para uso externo
window.ProductsSync = {
    start: startProductSync,
    stop: stopProductSync,
    syncNow: syncProductsFromMongoDB
};

console.log('📦 Products Sync v4 (MongoDB Real-time) carregado');
