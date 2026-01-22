/**
 * Products Sync - Sincroniza cards estáticos com o Banco de Dados (IndexedDB)
 * Garante que fotos e status alterados no admin reflitam em todo o site
 */

async function syncStaticProducts() {
    if (!window.DBManager) {
        console.warn('DBManager não encontrado para sincronização.');
        return;
    }

    try {
        if (!window.DBManager.ready) {
            await window.DBManager.init();
        }

        const allProducts = await window.DBManager.getAllProducts();
        if (!allProducts || allProducts.length === 0) return;

        // Mapeia produtos por nome para busca rápida
        const productsMap = {};
        allProducts.forEach(p => {
            productsMap[p.name.toLowerCase().trim()] = p;
        });

        // 1. Sincroniza CARDS (Página Inicial e Subpáginas)
        const cards = document.querySelectorAll('.card, .card-dark, .color-card, .product-card-home');

        cards.forEach(card => {
            const titleEl = card.querySelector('h3, h5, .card-title, .card-title-dark');
            if (!titleEl) return;

            const productName = titleEl.textContent.trim().toLowerCase();
            const productData = productsMap[productName];

            if (productData) {
                // Atualiza a Imagem
                const img = card.querySelector('img');
                if (img && productData.image) {
                    // Se for uma subpágina, ajusta o caminho se necessário
                    let imageSrc = productData.image;
                    const isSubpage = window.location.pathname.includes('/paginas/');

                    if (isSubpage && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http') && !imageSrc.startsWith('../')) {
                        imageSrc = '../' + imageSrc;
                    } else if (!isSubpage && imageSrc.startsWith('../')) {
                        imageSrc = imageSrc.replace('../', '');
                    }

                    if (img.src !== imageSrc) {
                        img.src = imageSrc;
                        console.log(`📸 Imagem sincronizada: ${productData.name}`);
                    }
                }

                // Atualiza Status (Disponibilidade)
                const statusBadge = card.querySelector('.status-badge, .btn-success-pill, .btn-danger-pill, .availability');
                if (statusBadge) {
                    const isAvailable = productData.status === 'available';

                    if (statusBadge.classList.contains('btn-success-pill') || statusBadge.classList.contains('btn-danger-pill')) {
                        // Estilo Pilha (Subpáginas)
                        statusBadge.className = isAvailable ? 'btn btn-success-pill btn-sm' : 'btn btn-danger-pill btn-sm';
                        statusBadge.innerHTML = isAvailable
                            ? '<i class="fas fa-check-circle me-1"></i> Disponível'
                            : '<i class="fas fa-times-circle me-1"></i> Indisponível';
                    } else {
                        // Estilo Badge Padrão
                        statusBadge.className = `status-badge ${productData.status}`;
                        statusBadge.textContent = isAvailable ? 'Disponível' : 'Indisponível';
                    }
                }

                // Desativar botão de compra se estiver indisponível
                const buyBtn = card.querySelector('.btn-primary-pill, .btn-outline-primary');
                if (buyBtn) {
                    if (productData.status === 'unavailable') {
                        buyBtn.classList.add('disabled');
                        buyBtn.style.opacity = '0.5';
                        buyBtn.style.pointerEvents = 'none';
                        buyBtn.innerHTML = '<i class="fas fa-ban me-2"></i> Indisponível';
                    } else {
                        buyBtn.classList.remove('disabled');
                        buyBtn.style.opacity = '1';
                        buyBtn.style.pointerEvents = 'auto';
                        if (!buyBtn.innerHTML.includes('Comprar') && !buyBtn.innerHTML.includes('Detalhes')) {
                            buyBtn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i> Comprar';
                        }
                    }
                }
            }
        });

        // 2. Sincroniza SELETORES DE CORES (Se existirem na página)
        const colorOptions = document.querySelectorAll('.color-option input');
        colorOptions.forEach(input => {
            const label = input.closest('.color-option');
            if (!label) return;

            const colorName = input.dataset.color || label.querySelector('.color-name')?.textContent;
            if (!colorName) return;

            // Tenta encontrar o produto baseado na seção (ex: Malha PV + Cor)
            const section = input.closest('section');
            const sectionTitle = section?.querySelector('h1')?.textContent || '';

            const fullName = `${sectionTitle} ${colorName}`.toLowerCase().trim();
            const productData = productsMap[fullName] || productsMap[colorName.toLowerCase().trim()];

            if (productData && productData.status === 'unavailable') {
                label.style.opacity = '0.4';
                label.title = 'Cor indisponível no momento';
                // Opcional: impedir seleção
                // input.disabled = true;
            } else {
                label.style.opacity = '1';
                label.title = '';
            }
        });

    } catch (error) {
        console.error('Erro na sincronização de produtos:', error);
    }
}

// Inicia sincronização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        syncStaticProducts();
        // Auto-refresh suave a cada 5 segundos
        setInterval(syncStaticProducts, 5000);
    });
} else {
    syncStaticProducts();
    setInterval(syncStaticProducts, 5000);
}

// Exporta
window.ProductsSync = {
    run: syncStaticProducts
};
