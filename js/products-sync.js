/**
 * Products Sync v3 - Sincronização Robusta e Holística
 * Resolve incompatibilidades de nomes e caminhos entre Admin e Site
 */

async function syncStaticProducts() {
    if (!window.DBManager) return;

    try {
        if (!window.DBManager.ready) await window.DBManager.init();

        const allProducts = await window.DBManager.getAllProducts();
        if (!allProducts || allProducts.length === 0) return;

        // Mapeamentos para busca flexível
        const productsByName = {};
        const productsByCatColor = {};
        const productsByCatFirst = {};

        allProducts.forEach(p => {
            const nameKey = p.name.toLowerCase().trim();
            const catKey = p.category.toLowerCase().trim();
            const colorKey = p.color.toLowerCase().trim();

            productsByName[nameKey] = p;
            productsByCatColor[`${catKey}|${colorKey}`] = p;

            // Prioriza o primeiro disponível de cada categoria
            if (!productsByCatFirst[catKey] || (productsByCatFirst[catKey].status !== 'available' && p.status === 'available')) {
                productsByCatFirst[catKey] = p;
            }
        });

        // 1. Sincroniza CARDS
        const cards = document.querySelectorAll('.card, .card-dark, .color-card, .product-card-home, .product-card');

        cards.forEach(card => {
            let productData = null;

            // Tenta 1: Por Título (Exato ou Parcial)
            const titleEl = card.querySelector('h3, h5, .card-title, .card-title-dark');
            const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : "";

            if (titleText) {
                productData = productsByName[titleText];

                // Tenta 1.1: Fuzzy match para nomes como "Viscose-Elastano"
                if (!productData) {
                    const simplified = titleText.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
                    productData = productsByName[simplified];

                    // Tenta 1.2: Match por conter o nome (ex: "Viscose-Elastano Vermelha" contém "Viscose Vermelha"?)
                    if (!productData) {
                        productData = allProducts.find(p => titleText.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(titleText));
                    }
                }
            }

            // Tenta 2: Pelo HREF (Checkout ou Links de Página)
            const links = card.querySelectorAll('a[href]');
            links.forEach(link => {
                if (productData) return;
                const href = link.getAttribute('href').toLowerCase();

                // Caso A: Link de Checkout (produto=x&cor=y)
                const catMatch = href.match(/produto=([^&]+)/);
                const corMatch = href.match(/cor=([^&]+)/);

                if (catMatch) {
                    const cat = catMatch[1].replace('dry-fit', 'dryfit'); // Normaliza
                    if (corMatch) {
                        productData = productsByCatColor[`${cat}|${corMatch[1]}`];
                    } else {
                        productData = productsByCatFirst[cat];
                    }
                }

                // Caso B: Link de Página (usado na Home - ex: malha-pv.html)
                if (!productData && href.includes('paginas/')) {
                    const pageName = href.split('/').pop().replace('.html', '');
                    const cat = pageName.replace('malha-', '').replace('-light', '').replace('-', '');
                    // Mapeamento manual de categorias persistentes
                    const catMap = { 'pv': 'pv', 'pp': 'pp', 'piquet': 'piquet', 'helanca': 'helanca', 'dryfit': 'dryfit', 'viscose': 'viscose', 'moletom': 'moletom', 'algodao': 'algodao', 'oxford': 'oxford', 'helancaescolar': 'helanca-escolar' };
                    productData = productsByCatFirst[catMap[cat] || cat];
                }
            });

            // Ação de Sincronização se encontrou dados
            if (productData) {
                // FOTO
                const img = card.querySelector('img');
                if (img && productData.image) {
                    let src = productData.image;
                    if (!src.startsWith('data:') && !src.startsWith('http')) {
                        const isSub = window.location.pathname.includes('/paginas/') || window.location.href.includes('/paginas/');
                        src = src.replace(/^(\.\.\/)+/, '').replace(/^img\//, 'img/');
                        if (isSub) src = '../' + src;
                    }
                    if (img.src !== src) img.src = src;
                }

                // DISPONIBILIDADE - ✅ BASEADO EM ESTOQUE
                const isAvail = productData.stock > 0;

                // IMAGEM (Atualização Dinâmica)
                const imgEl = card.querySelector('img.card-img-top');
                if (imgEl && productData.image) {
                    // Atualiza src da imagem se for diferente
                    let newImageSrc;
                    if (productData.image.startsWith('http') || productData.image.startsWith('data:')) {
                        newImageSrc = productData.image;
                    } else {
                        newImageSrc = `../img/${productData.image}`;
                    }

                    if (imgEl.src !== newImageSrc && !imgEl.src.endsWith(productData.image)) {
                        imgEl.src = newImageSrc;
                        // console.log(`✅ Imagem atualizada: ${productData.name}`);
                    }
                }

                // NOME DO PRODUTO (Atualização Dinâmica)
                const titleEl = card.querySelector('.card-title-dark, h5');
                if (titleEl && productData.name) {
                    const currentTitle = titleEl.textContent.trim();
                    // Atualiza título se mudou no banco
                    if (!currentTitle.includes(productData.name.split(' ').slice(-1)[0])) {
                        titleEl.textContent = productData.name;
                        console.log(`✅ Nome atualizado: ${currentTitle} → ${productData.name}`);
                    }
                }

                // Badges/Botões de Status - ✅ VERDE se estoque > 0, VERMELHO se estoque = 0
                const statusEl = card.querySelector('.status-badge, .btn-success-pill, .btn-danger-pill, .availability, button[class*="btn-"][class*="-pill"]');
                if (statusEl) {
                    // Determinar se é um botão (btn) ou span/label
                    const isButton = statusEl.tagName === 'BUTTON';

                    if (isButton) {
                        // Remover classes antigas
                        statusEl.classList.remove('btn-success-pill', 'btn-danger-pill');

                        // Adicionar classe correta baseada no estoque
                        if (isAvail) {
                            statusEl.classList.add('btn-success-pill');
                            statusEl.innerHTML = '<i class="fas fa-check-circle me-1"></i> Disponível';
                        } else {
                            statusEl.classList.add('btn-danger-pill');
                            statusEl.innerHTML = '<i class="fas fa-times-circle me-1"></i> Indisponível';
                        }
                    } else if (statusEl.classList.contains('availability')) {
                        // Galeria com classe availability
                        statusEl.className = isAvail ? 'availability available' : 'availability unavailable';
                        statusEl.innerHTML = isAvail ? '<i class="fas fa-check-circle"></i> Disponível' : '<i class="fas fa-times-circle"></i> Indisponível';
                    } else {
                        // Padrão - status-badge
                        statusEl.className = isAvail ? 'status-badge available' : 'status-badge unavailable';
                        statusEl.innerHTML = isAvail ? '<i class="fas fa-check-circle me-1"></i> Disponível' : '<i class="fas fa-times-circle me-1"></i> Indisponível';
                    }

                    console.log(`🔄 Status: ${productData.name} → ${isAvail ? 'VERDE' : 'VERMELHO'} (Estoque: ${productData.stock})`);
                }

                // Botão de ação (Comprar)
                const actionBtn = card.querySelector('.btn-primary-pill, .btn-outline-primary, .card-link, .cta-button, .btn-success-pill, .btn-danger-pill');
                if (actionBtn && actionBtn.tagName !== 'SPAN') {
                    if (!isAvail) {
                        actionBtn.classList.add('disabled');
                        actionBtn.style.opacity = '0.4';
                        actionBtn.style.pointerEvents = 'none';
                        if (!actionBtn.textContent.includes('Indisponível')) {
                            const icon = actionBtn.querySelector('i');
                            actionBtn.innerHTML = '';
                            if (icon) actionBtn.appendChild(icon);
                            actionBtn.appendChild(document.createTextNode(' Indisponível'));
                        }
                    } else {
                        actionBtn.classList.remove('disabled');
                        actionBtn.style.opacity = '1';
                        actionBtn.style.pointerEvents = 'auto';
                    }
                }

                // PREÇO (Atualização Dinâmica)
                const priceElements = card.querySelectorAll('.fas.fa-tag ~ strong, .text-orange strong, .alert-dark strong');
                priceElements.forEach(priceEl => {
                    const parentText = priceEl.parentElement && priceEl.parentElement.textContent;
                    if (parentText && (parentText.includes('R$') || parentText.includes('kg'))) {
                        const newPriceText = `R$ ${(productData.price || 30).toFixed(2)} / kg`;
                        if (!priceEl.textContent.includes(newPriceText)) {
                            // Preserva ícone se houver
                            const icon = priceEl.previousElementSibling;
                            priceEl.textContent = newPriceText;
                        }
                    }
                });

                // ESTOQUE (Atualização Dinâmica)
                let stockEl = card.querySelector('.stock-display, .stock-label, .card-stock');
                if (!stockEl) {
                    // Tenta encontrar um lugar para injetar se não existir
                    const footer = card.querySelector('.card-footer-actions, .card-footer, .card-body');
                    if (footer) {
                        const stockDiv = document.createElement('div');
                        stockDiv.className = 'stock-display small text-white-50 mt-1';
                        stockDiv.style.fontSize = '0.8rem';
                        // Insere antes do status ou botão se possível
                        const statusBadge = footer.querySelector('.btn-success-pill, .btn-danger-pill, .status-badge, .availability');
                        if (statusBadge) {
                            footer.insertBefore(stockDiv, statusBadge);
                        } else {
                            footer.appendChild(stockDiv);
                        }
                        stockEl = stockDiv;
                    }
                }

                if (stockEl) {
                    const stockVal = productData.stock || 0;
                    stockEl.innerHTML = `<i class="fas fa-layer-group me-1"></i> Estoque: <strong>${stockVal}</strong>`;
                    if (stockVal <= 0) {
                        stockEl.classList.add('text-danger');
                        stockEl.classList.remove('text-white-50');
                    } else {
                        stockEl.classList.remove('text-danger');
                    }
                }
            }
        });

    } catch (e) {
        console.error('Erro de Sync:', e);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    syncStaticProducts();
    setInterval(syncStaticProducts, 2000); // 2s para resposta rápida
});

// Força execução caso DOM já carregado
if (document.readyState !== 'loading') syncStaticProducts();
