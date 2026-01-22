// ===== CHECKOUT.JS - Controle da Página de Finalização de Compra =====

document.addEventListener('DOMContentLoaded', function () {

    // Mapeamento de produtos para fotos e especificações
    const productData = {
        'malha-pv': {
            name: 'Malha PV',
            specs: [
                'Alta durabilidade',
                'Secagem rápida',
                'Conforto térmico',
                'Fácil manutenção'
            ],
            colors: {
                'preta': 'malha-pv-preta.jpg',
                'bege': 'malha-pv-bege.jpg',
                'azul-royal': 'malha-pv-azul-royal.jpg',
                'verde-musgo': 'malha-pv-verde-musgo.jpg'
            }
        },
        'malha-pp': {
            name: 'Malha PP',
            specs: [
                'Ultraleve',
                'Resistente à abrasão',
                'Não absorve umidade',
                'Hipoalergênico'
            ],
            colors: {
                'preta': 'malha-pp-preta.jpg',
                'vinho': 'malha-pp-vinho.jpg'
            }
        },
        'malha-piquet': {
            name: 'Malha Piquet',
            specs: [
                'Textura diferenciada',
                'Respirabilidade superior',
                'Elegância casual',
                'Versatilidade'
            ],
            colors: {
                'azul-marinho': 'azul-marinho-piquet-pv.jpg',
                'vermelho': 'vermelho-piquet-pv.jpg',
                'cinza-chumbo': 'malha-piquet-pa-cinza-chumbo.jpg',
                'verde-bandeira': 'malha-piquet-pa-bandeira.jpg'
            }
        },
        'helanca-light': {
            name: 'Helanca Light',
            specs: [
                'Alta elasticidade',
                'Ajuste perfeito',
                'Leve e respirável',
                'Ideal para fitness'
            ],
            colors: {
                'preto': 'helanca-light-preto.jpg',
                'bordo': 'helanca-light-bordo.jpg'
            }
        },
        'algodao': {
            name: 'Algodão Penteado',
            specs: [
                '100% Natural',
                'Maciez superior',
                'Alta absorção',
                'Respirável'
            ],
            colors: {
                'branco': 'algodao-branco.png',
                'preto': 'algodao-preto.png',
                'cinza-claro': 'algodao-cinza-claro.jpg'
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
