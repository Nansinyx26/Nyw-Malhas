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
        'helanca': ['helanca', 'helanca-light'],
        'algodao': ['algodao', 'meia-malha'],
        'helanca-escolar': ['helanca-escolar'],
        'dry-fit': ['dryfit'],
        'viscose': ['viscose'],
        'moletom': ['moletom'],
        'oxford': ['oxford'],
        'pv': ['pv'],
        'pp': ['pp'],
        'piquet': ['piquet']
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

        // Botão de ação (Comprar) - SEMPRE HABILITADO AGORA
        const orderButton = section.querySelector('.order-cta button, .btn-orange');
        if (orderButton) {
            // Mantém sempre habilitado, mas adiciona aviso visual se indisponível
            orderButton.disabled = false;
            orderButton.style.opacity = '1';
            orderButton.style.cursor = 'pointer';

            if (!isAvailable) {
                // Adiciona um estilo leve de aviso, mas mantém funcional
                orderButton.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i> FAZER PEDIDO (Sem Estoque)`;
                orderButton.classList.add('btn-warning');
                orderButton.classList.remove('btn-orange');
            } else {
                orderButton.innerHTML = `<i class="fas fa-shopping-cart me-2"></i> FAZER PEDIDO AGORA`;
                orderButton.classList.add('btn-orange');
                orderButton.classList.remove('btn-warning');
            }
        }

        console.log(`🔄 Seção ${sectionId}: ${statusText} (Estoque: ${totalStock})`);
    });

    // Sincroniza também os cards de cores individuais se existirem
    syncColorOptions(allProducts, productsByCatColor);

    // Sincroniza cards de produto individuais (usados nas subpáginas)
    syncProductCards(allProducts, productsByCategory);
}

/**
 * Sincroniza cards de produtos individuais (usados em subpáginas como malha-pv.html)
 */
function syncProductCards(allProducts, productsByCategory) {
    const cards = document.querySelectorAll('.card-dark, .card, .product-card');

    cards.forEach(card => {
        // Tenta encontrar o nome do produto no card
        const titleEl = card.querySelector('.card-title, .card-title-dark, h5');
        if (!titleEl) return;

        const productName = titleEl.textContent.trim();

        // Busca o produto correspondente no banco
        // 1. Tenta pelo nome exato, parcial ou fuzzy
        let product = allProducts.find(p => {
            const dbName = p.name.toLowerCase().trim();
            const cardName = productName.toLowerCase().trim();

            // Match exato
            if (dbName === cardName) return true;

            // Match parcial direto
            if (dbName.includes(cardName) || cardName.includes(dbName)) return true;

            // Match normalizado (ignora prefixos comuns)
            const cleanDb = dbName.replace(/malha |tecido |meia /g, '');
            const cleanCard = cardName.replace(/malha |tecido |meia /g, '');
            return cleanDb.includes(cleanCard) || cleanCard.includes(cleanDb);
        });

        // 2. Tenta encontrar pela cor/imagem se o nome for genérico
        if (!product) {
            const imgEl = card.querySelector('img');
            if (imgEl) {
                const src = imgEl.getAttribute('src'); // Pega o atributo direto para evitar caminho completo
                product = allProducts.find(p => p.image && (src.includes(p.image) || p.image.includes(src)));
            }
        }

        if (product) {
            const isAvailable = (product.stock || 0) > 0;
            const statusText = isAvailable ? 'Disponível' : 'Indisponível';
            const statusIcon = isAvailable ? 'fa-check-circle' : 'fa-times-circle';

            // Atualiza badge de status existente
            const statusBtn = card.querySelector('.btn-success-pill, .btn-danger-pill, .status-badge');
            if (statusBtn) {
                // Remove classes antigas
                statusBtn.classList.remove('btn-success-pill', 'btn-danger-pill');

                // Adiciona nova classe
                statusBtn.classList.add(isAvailable ? 'btn-success-pill' : 'btn-danger-pill');

                // Atualiza texto e ícone
                statusBtn.innerHTML = `<i class="fas ${statusIcon} me-1"></i> ${statusText}`;

                // Garante que pareça um badge, não um botão clicável se não for para sê-lo
                statusBtn.disabled = true;
                statusBtn.style.opacity = '1';
            }

            // Atualiza botão de compra do card
            const buyBtn = card.querySelector('.btn-primary-pill, .btn-outline-primary, .cta-button');
            if (buyBtn) {
                if (!isAvailable) {
                    // Estilo de aviso
                    buyBtn.classList.remove('btn-primary-pill', 'btn-outline-primary');
                    buyBtn.classList.add('btn-warning');
                    buyBtn.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i> Sem Estoque`;

                    // Comportamento de clique (Alerta)
                    // Remove listeners antigos (clone) para evitar múltiplos alertas
                    const newBtn = buyBtn.cloneNode(true);
                    buyBtn.parentNode.replaceChild(newBtn, buyBtn);

                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        alert('Produto indisponível no momento.\n\nEste item não está disponível para venda.');
                    });
                } else {
                    // Restaura botão normal se estiver disponível
                    if (buyBtn.classList.contains('btn-warning')) {
                        buyBtn.classList.remove('btn-warning');
                        buyBtn.classList.add('btn-primary-pill');
                        buyBtn.innerHTML = `<i class="fas fa-shopping-cart me-2"></i> Comprar`;
                    }

                    // Dinamicamente anexa o productId sem quebrar o caminho relativo
                    const originalHref = buyBtn.getAttribute('href');
                    if (originalHref && product._id) {
                        try {
                            const separator = originalHref.includes('?') ? '&' : '?';
                            if (!originalHref.includes('productId=')) {
                                buyBtn.setAttribute('href', `${originalHref}${separator}productId=${product._id}`);
                                console.log(`🔗 URL atualizada (relativa): ${buyBtn.getAttribute('href')}`);
                            }
                        } catch (e) {
                            console.error('Erro ao atualizar URL do botão:', e);
                        }
                    }
                }
            }



            // Atualiza imagem
            if (product.image && !product.image.includes('placeholder')) {
                const imgEl = card.querySelector('img.card-img-top');
                // Validação extra: Só troca se for base64 válido ou caminho real diferente
                const isValidImage = product.image.startsWith('data:image') || product.image.length > 20;

                if (imgEl && isValidImage) {
                    let finalSrc = product.image;
                    // Correção para subpáginas: Adicionar '../' se for caminho relativo simples
                    if (window.location.pathname.includes('/paginas/') && !finalSrc.startsWith('data:') && !finalSrc.startsWith('http') && !finalSrc.startsWith('../')) {
                        finalSrc = '../' + finalSrc;
                    }

                    if (imgEl.getAttribute('src') !== finalSrc) {
                        imgEl.src = finalSrc;
                    }
                }
            }
        }
    });
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

    // Sincroniza a cada 10 segundos para economizar bateria e CPU
    syncInterval = setInterval(() => {
        syncProductsFromMongoDB();
    }, 10000);

    console.log('✅ Sincronização de produtos otimizada (10 segundos)');
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
