// ===== CHECKOUT.JS - Controle da Página de Finalização de Compra =====

document.addEventListener('DOMContentLoaded', async function () {

    // Mapeamento de produtos para fotos e especificações
    const productData = {
        'malha-pv': {
            name: 'Malha PV',
            specs: ['Alta durabilidade', 'Secagem rápida', 'Conforto térmico', 'Fácil manutenção'],
            colors: {
                'preta': 'malha-pv-preta.jpg',
                'bege': 'malha-pv-bege.jpg',
                'azul-royal': 'malha-pv-azul-royal.jpg',
                'verde-musgo': 'malha-pv-verde-musgo.jpg',
                'cinza-mescla': 'malha-pv-cinza-mescla.png',
                'vermelha': 'malha-pv-vermelha.png'
            }
        },
        'malha-pp': {
            name: 'Malha PP',
            specs: ['Ultraleve', 'Resistente à abrasão', 'Não absorve umidade', 'Hipoalergênico'],
            colors: {
                'preta': 'malha-pp-preta.jpg',
                'vinho': 'malha-pp-vinho.jpg',
                'branca': 'malha-pp-branca.png',
                'azul-marinho': 'malha-pp-azul-marinho.png'
            }
        },
        'malha-piquet': {
            name: 'Malha Piquet',
            specs: ['Textura diferenciada', 'Respirabilidade superior', 'Elegância casual', 'Versatilidade'],
            colors: {
                'azul-marinho': 'azul-marinho-piquet-pv.jpg',
                'vermelho': 'vermelho-piquet-pv.jpg',
                'cinza-chumbo': 'malha-piquet-pa-cinza-chumbo.jpg',
                'verde-bandeira': 'malha-piquet-pa-bandeira.jpg',
                'branco': 'malha-piquet-branca.png',
                'preto': 'malha-piquet-preta.png'
            }
        },
        'helanca-light': {
            name: 'Helanca Light',
            specs: ['Alta elasticidade', 'Ajuste perfeito', 'Leve e respirável', 'Ideal para fitness'],
            colors: {
                'preto': 'helanca-light-preto.jpg',
                'bordo': 'helanca-light-bordo.jpg',
                'azul-royal': 'helanca-light-azul-royal.png',
                'rosa-pink': 'helanca-light-rosa-pink.png'
            }
        },
        'algodao': {
            name: 'Algodão 30.1',
            specs: ['100% Algodão', 'Fio Penteado', 'Hipoalergênico', 'Toque Macio'],
            colors: {
                'variadas': 'algodao.png',
                'branco': 'algodao-branco.png',
                'azul-marinho': 'algodao-azul-marinho.png',
                'vermelho': 'algodao-vermelho.png'
            }
        },
        'dry-fit': {
            name: 'Malha Dry Fit',
            specs: ['Secagem Rápida', '100% Poliamida', 'Ideal para Esportes', 'Leve (130g)'],
            colors: {
                'variadas': 'dry-fit.png',
                'azul': 'dry-fit.png',
                'azul-royal': 'dry-fit.png',
                'branco': 'dry-fit-branco.png',
                'preto': 'dry-fit-preto.jpg'
            }
        },
        'viscose': {
            name: 'Viscose c/ Elastano',
            specs: ['Caimento Fluido', 'Toque Gelado', 'Conforto', '96% Viscose'],
            colors: {
                'variadas': 'viscose.png',
                'vermelha': 'viscose.png',
                'cinza-mescla': 'viscose-cinza-mescla.png',
                'vinho': 'viscose-vinho.jpg'
            }
        },
        'moletom': {
            name: 'Moletom 3 Cabos',
            specs: ['Felpado/Inverno', '320 g/m² (Pesado)', 'Alta Resistência', '50% Alg / 50% Pol'],
            colors: {
                'variadas': 'moletom.png',
                'cinza-mescla': 'moletom.png',
                'azul-marinho': 'moletom-azul-marinho.png',
                'bordo': 'moletom-bordo.jpg'
            }
        },
        'helanca-escolar': {
            name: 'Helanca Escolar',
            specs: ['Indestrutível', 'Não Desbota', '100% Poliéster', 'Uso Diário'],
            colors: {
                'azul-marinho': 'helanca-escolar.png',
                'verde-bandeira': 'helanca-escolar-verde-bandeira.png',
                'cinza': 'helanca-escolar-cinza.png',
                'variadas': 'helanca-escolar.png'
            }
        },
        'oxford': {
            name: 'Tecido Oxford',
            specs: ['Nobre e Prático', 'Não Amarrota', '100% Poliéster', 'Camisaria/Avental'],
            colors: {
                'variadas': 'oxford.png',
                'cinza': 'oxford.png',
                'azul-marinho': 'oxford.png',
                'vermelho': 'oxford-vermelho.jpg'
            }
        }
    };

    // Pegar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const product = urlParams.get('produto');
    const color = urlParams.get('cor');

    // Validar se os parâmetros existem
    if (!product || !color || !productData[product] || !productData[product].colors[color]) {
        alert('Produto ou cor inválidos!');
        window.location.href = 'index.html';
        return;
    }

    // ===== VERIFICAÇÃO DE DISPONIBILIDADE NO BANCO =====
    try {
        if (window.DBManager) {
            await window.DBManager.init();
            const dbProducts = await window.DBManager.getAllProducts();

            // Encontra o produto no banco buscando por nome ou categoria + cor
            // Como o nome no banco pode ser diferente (ex: "Malha PV Preta"), usamos uma busca aproximada
            // ou verificamos categoria e cor.

            const productKey = productData[product].name; // Ex: "Malha PV"
            const colorKey = color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Ex: "Preta", "Azul Royal"

            // Tenta encontrar correspondência
            const dbProduct = dbProducts.find(p => {
                // Normaliza strings para comparação segura
                const pName = p.name.toLowerCase();
                const pColor = p.color.toLowerCase();
                const targetName = productKey.toLowerCase();
                const targetColor = colorKey.toLowerCase();

                // Verifica se a cor bate e se o nome do produto contém a categoria principal
                return pColor === targetColor && pName.includes(targetName.split(' ')[0].toLowerCase());
            });

            if (dbProduct && dbProduct.status === 'unavailable') {
                alert(`O produto ${productKey} na cor ${colorKey} está temporariamente indisponível.`);
                window.location.href = 'index.html';
                return;
            }
        }
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        // Em caso de erro no banco, permite continuar (fail-open) ou bloqueia?
        // Fail-open: permite a venda. Fail-closed: bloqueia.
        // Vamos permitir continuar para não travar vendas se o DB falhar.
    }

    // Carregar dados do produto
    const productInfo = productData[product];
    const imagePath = 'img/' + productInfo.colors[color];
    const colorDisplay = color.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Atualizar elementos da página
    document.getElementById('productImage').src = imagePath;
    document.getElementById('productImage').alt = `${productInfo.name} - ${colorDisplay}`;
    document.getElementById('productTitle').textContent = productInfo.name;
    document.getElementById('colorName').textContent = colorDisplay;

    // Atualizar especificações
    const specsList = document.getElementById('productSpecs');
    specsList.innerHTML = productInfo.specs.map(spec =>
        `<li><i class="fas fa-check text-primary me-2"></i> ${spec}</li>`
    ).join('');

    // ===== SELETOR DE CORES =====
    const colorContainer = document.getElementById('colorSelectorContainer');
    if (colorContainer) {
        colorContainer.innerHTML = ''; // Limpar container
        const colors = productInfo.colors;

        for (const [key, value] of Object.entries(colors)) {
            const colorDiv = document.createElement('div');
            const colorDisplayName = key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Estilizar o botão de cor
            colorDiv.className = 'color-option-btn';
            colorDiv.style.width = '30px';
            colorDiv.style.height = '30px';
            colorDiv.style.borderRadius = '50%';
            colorDiv.style.cursor = 'pointer';
            colorDiv.style.border = '2px solid rgba(0,0,0,0.1)';
            colorDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            colorDiv.title = colorDisplayName;

            // Tentar inferir a cor visualmente para o background (simplificado)
            // Mapeamento básico para cores comuns
            const colorMap = {
                'preta': '#000', 'preto': '#000',
                'branca': '#fff', 'branco': '#fff',
                'azul-royal': '#4169E1', 'azul-marinho': '#000080', 'azul': '#0000FF',
                'vermelha': '#FF0000', 'vermelho': '#FF0000',
                'vinho': '#800000', 'bordo': '#800000', 'bordô': '#800000',
                'verde-musgo': '#556B2F', 'verde-bandeira': '#006400', 'verde': '#008000',
                'cinza-mescla': '#808080', 'cinza-chumbo': '#696969', 'cinza': '#808080', 'chumbo': '#2F4F4F',
                'bege': '#F5F5DC',
                'rosa-pink': '#FF1493', 'rosa': '#FFC0CB',
                'amarelo': '#FFFF00', 'laranja': '#FF8C00',
                'variadas': 'linear-gradient(45deg, red, blue, green, yellow)'
            };

            // Se for gradiente (variadas), usa background, senão backgroundColor
            if (colorMap[key] && colorMap[key].includes('gradient')) {
                colorDiv.style.background = colorMap[key];
            } else {
                colorDiv.style.backgroundColor = colorMap[key] || '#ccc'; // Fallback cinza
            }

            // Marcar o selecionado
            if (key === color) {
                colorDiv.style.border = '3px solid #ff6600';
                colorDiv.style.transform = 'scale(1.2)';
                colorDiv.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.5)';
            }

            // Hover effects via JS para garantir feedback imediato
            colorDiv.onmouseover = function () {
                if (window.checkoutColorName !== colorDisplayName) {
                    this.style.transform = 'scale(1.1)';
                    this.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                }
            };
            colorDiv.onmouseout = function () {
                if (window.checkoutColorName !== colorDisplayName) {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                }
            };

            colorDiv.onclick = function () {
                // Atualizar imagens e textos
                const newImagePath = 'img/' + value;
                const newColorDisplay = colorDisplayName;

                document.getElementById('productImage').src = newImagePath;
                document.getElementById('productImage').alt = `${productInfo.name} - ${newColorDisplay}`;
                document.getElementById('colorName').textContent = newColorDisplay;

                // Atualizar variáveis globais do modal de forma segura
                window.checkoutColorName = newColorDisplay;
                const orderColorInput = document.getElementById('orderColor');
                if (orderColorInput) orderColorInput.value = newColorDisplay;

                // Atualizar visual da seleção
                Array.from(colorContainer.children).forEach(c => {
                    c.style.border = '2px solid rgba(0,0,0,0.1)';
                    c.style.transform = 'scale(1)';
                    c.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                });
                colorDiv.style.border = '3px solid #ff6600';
                colorDiv.style.transform = 'scale(1.2)';
                colorDiv.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.5)';

                // Atualizar URL sem recarregar
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('cor', key);
                window.history.replaceState(null, '', newUrl);

                console.log(`Cor alterada para: ${newColorDisplay}`);
            };

            colorContainer.appendChild(colorDiv);
        }
    }

    // Salvar dados para o modal
    window.checkoutProductName = productInfo.name;
    window.checkoutColorName = colorDisplay;

    // ===== CALCULADORA DE FRETE (CHECKOUT) =====
    const zipInput = document.getElementById('checkoutZip');
    const qtyInput = document.getElementById('checkoutQty');
    const calcButton = document.getElementById('btnCalculateShipping');
    const resultDiv = document.getElementById('shippingResult');

    // Máscara de CEP
    zipInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.substring(0, 5) + '-' + value.substring(5, 8);
        e.target.value = value;
    });

    calcButton.addEventListener('click', async function () {
        const cep = zipInput.value.replace(/\D/g, '');
        const qty = parseFloat(qtyInput.value) || 1;

        if (cep.length !== 8) {
            alert('Por favor, digite um CEP válido.');
            return;
        }

        calcButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Calculando...';
        calcButton.disabled = true;

        try {
            // 1. Consultar ViaCEP para pegar o UF
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert('CEP não encontrado!');
                resetCalcButton();
                return;
            }

            // 2. Calcular usando a Matriz Realista (shipping-rates.js)
            // Assumimos 1kg/metro inicial para simulação se não houver quantidade definida
            const results = calculateShippingDetails(data.uf, qty, 'metro(s)');

            if (results) {
                const resultsHtml = `
                    <div class="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style="background: rgba(0,0,0,0.2);">
                        <div class="text-start">
                            <span class="text-white fw-bold"><i class="fas fa-box text-primary me-2"></i> PAC</span>
                            <div class="text-white-50 small ms-4">${results.pac.days} dias úteis</div>
                        </div>
                        <span class="text-white fw-bold">${results.pac.formatted}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 p-2 rounded" style="background: rgba(0,0,0,0.2);">
                        <div class="text-start">
                            <span class="text-white fw-bold"><i class="fas fa-shipping-fast text-warning me-2"></i> SEDEX</span>
                            <div class="text-white-50 small ms-4">${results.sedex.days} dias úteis</div>
                        </div>
                        <span class="text-white fw-bold">${results.sedex.formatted}</span>
                    </div>
                    <small class="text-white-50 d-block mt-2" style="font-size: 0.8rem;">
                        <i class="fas fa-exclamation-triangle me-1"></i> 
                        *Valor aproximado para ${qty} unidade(s). Pode variar conforme peso final.
                    </small>
                `;

                resultDiv.innerHTML = resultsHtml;
                resultDiv.classList.remove('d-none');
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao calcular frete. Tente novamente.');
        } finally {
            resetCalcButton();
        }
    });

    function resetCalcButton() {
        calcButton.innerHTML = '<i class="fas fa-search me-2"></i> Calcular Estimativa';
        calcButton.disabled = false;
    }
});

// Função para abrir o modal a partir da página de checkout
window.openOrderModalFromCheckout = function () {
    openOrderModal(window.checkoutProductName, window.checkoutColorName);
};
