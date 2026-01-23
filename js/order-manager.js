// ===== ORDER-MANAGER.JS - Lógica do Sistema de Pedidos =====

document.addEventListener('DOMContentLoaded', function () {
    const orderForm = document.getElementById('orderForm');
    const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));

    // Configurações da Empresa
    const companyConfig = {
        phone: '5519981600429', // Número NYW Malhas
        currency: 'R$ '
    };

    // Tabela de Estimativa de Frete por Região (Baseado na UF)
    // Valores base simulados para dar realismo
    const PRODUCT_CATALOG = {
        'malha-pv': { name: 'Malha PV', price: 30.00, unit: 'Kg', weightFactor: 0.33 },
        'malha-pp': { name: 'Malha PP', price: 30.00, unit: 'Kg', weightFactor: 0.25 },
        'malha-piquet': { name: 'Malha Piquet', price: 30.00, unit: 'Kg', weightFactor: 0.35 },
        'helanca-light': { name: 'Helanca Light', price: 30.00, unit: 'Kg', weightFactor: 0.20 },
        // NOVOS PRODUTOS (Preço Fixo R$ 30,00/kg)
        'dry-fit': { name: 'Dry Fit', price: 30.00, unit: 'Kg', weightFactor: 0.25 }, // 1m = 0.25kg
        'viscose': { name: 'Viscose c/ Elastano', price: 30.00, unit: 'Kg', weightFactor: 0.35 },
        'moletom': { name: 'Moletom', price: 30.00, unit: 'Kg', weightFactor: 0.60 },
        'helanca-escolar': { name: 'Helanca Escolar', price: 30.00, unit: 'Kg', weightFactor: 0.40 },
        'algodao': { name: 'Algodão', price: 30.00, unit: 'Kg', weightFactor: 0.30 },
        'oxford': { name: 'Oxford', price: 30.00, unit: 'Kg', weightFactor: 0.25 }
    };
    const shippingRates = {
        'SP': { base: 25.00, perKg: 1.50 },
        'RJ': { base: 28.00, perKg: 1.80 },
        'MG': { base: 26.00, perKg: 1.60 },
        'ES': { base: 30.00, perKg: 1.90 },
        'PR': { base: 28.00, perKg: 1.70 },
        'SC': { base: 32.00, perKg: 2.00 },
        'RS': { base: 35.00, perKg: 2.20 },
        'DF': { base: 38.00, perKg: 2.50 },
        'GO': { base: 38.00, perKg: 2.50 },
        // Padrão para outros estados (Norte/Nordeste/Centro-Oeste)
        'default': { base: 55.00, perKg: 3.50 }
    };

    // ===== FUNÇÕES AUXILIARES =====
    function formatCurrency(value) {
        return companyConfig.currency + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function parseCurrency(str) {
        if (!str) return 0;
        return parseFloat(str.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
    }

    // ===== LÓGICA DE CEP (VIACEP) =====
    const cepInput = document.getElementById('addrZip');

    cepInput.addEventListener('input', function (e) {
        let cep = e.target.value.replace(/\D/g, '');

        // Máscara visual
        if (cep.length > 5) {
            e.target.value = cep.substring(0, 5) + '-' + cep.substring(5, 8);
        } else {
            e.target.value = cep;
        }

        // Consultar API quando completar 8 dígitos
        if (cep.length === 8) {
            fetchAddress(cep);
        }
    });

    async function fetchAddress(cep) {
        try {
            // Visual feedback de carregamento
            document.getElementById('addrStreet').placeholder = "Buscando...";

            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                document.getElementById('addrStreet').value = data.logradouro;
                document.getElementById('addrNeighborhood').value = data.bairro;
                document.getElementById('addrCity').value = data.localidade;
                document.getElementById('addrUF').value = data.uf;
                document.getElementById('addrNumber').focus();

                // Dispara o cálculo de frete assim que tivermos o UF
                calculateShipping();
            } else {
                alert('CEP não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            document.getElementById('addrStreet').placeholder = "Endereço";
        }
    }

    // ===== CÁLCULO DE FRETE INTELIGENTE =====
    function calculateShipping() {
        const uf = document.getElementById('addrUF').value;
        const quantity = parseFloat(document.getElementById('orderQuantity').value) || 1;
        const unit = document.getElementById('orderUnit').value;
        const method = document.getElementById('shippingMethod').value; // 'Correios' (PAC default in this logic) or specific logic?

        if (!uf) return;

        // Usar a matriz compartilhada
        const details = calculateShippingDetails(uf, quantity, unit);

        // Lógica de seleção (Simplificada para o Modal: Se Transportadora = Sedex Price * 0.9, se Correios = PAC Price)
        // O ideal seria ter um rádio button PAC/SEDEX no modal também, mas vou inferir pelo select existente.

        let shippingCost = 0;

        // No HTML atual temos "Correios" e "Transportadora". 
        // Vamos assumir: Correios = PAC, Transportadora = SEDEX (ou similar premium)
        // Ou melhor: Vamos tentar detectar se o usuário quer rapidez ou preço.
        // Como o select box é simples, vamos usar o valor do PAC para "Correios"

        if (method === 'Correios') {
            shippingCost = details.pac.price;
        } else {
            // Transportadora geralmente compete com Sedex em prazo
            shippingCost = details.sedex.price;
        }

        // Atualizar campo de frete
        const shippingInput = document.getElementById('shippingCost');
        shippingInput.value = formatCurrency(shippingCost);

        updateValues();
    }

    document.getElementById('orderQuantity').addEventListener('input', calculateShipping);
    document.getElementById('shippingMethod').addEventListener('change', calculateShipping);
    document.getElementById('orderUnit').addEventListener('change', calculateShipping);


    // ===== ABRIR MODAL =====
    window.openOrderModal = function (product, color) {
        document.getElementById('orderProduct').value = product;

        // Cor padrão se não fornecida
        const selectedColor = color || window.checkoutColorName || 'Selecione abaixo';
        document.getElementById('orderColor').value = selectedColor;

        // Atualizar imagem no modal se estivermos no checkout
        const productImage = document.getElementById('productImage');
        const modalImage = document.getElementById('modalProductImage');
        if (productImage && modalImage) {
            modalImage.src = productImage.src;
            modalImage.alt = productImage.alt;
        }

        // Resetar campos
        document.getElementById('orderQuantity').value = '';
        document.getElementById('shippingCost').value = '';
        document.getElementById('labelTotal').innerText = 'R$ 0,00';

        updateValues();
        orderModal.show();
    };

    // ===== ATUALIZAR VALORES TOTAIS =====
    function updateValues() {
        const productKey = new URLSearchParams(window.location.search).get('produto');
        const product = PRODUCT_CATALOG[productKey];
        if (!product) return;

        const quantity = parseFloat(document.getElementById('orderQuantity').value) || 0;
        const shippingCost = parseFloat(parseCurrency(document.getElementById('shippingCost').value)) || 0;
        const unit = document.getElementById('orderUnit').value;

        // Fixar Preço Unitário Visualmente
        document.getElementById('orderUnitPrice').value = 'R$ 30,00';

        let finalWeight = quantity;
        let subtotal = 0;
        const weightDisplay = document.getElementById('weightDisplay');

        // Lógica de Conversão Metros -> Kg para produtos de R$30
        if (unit === 'metro(s)' && product.weightFactor) {
            finalWeight = quantity * product.weightFactor;
            // Exibir aviso visual de conversão
            weightDisplay.innerHTML = `<i class="fas fa-balance-scale"></i> ${quantity}m ≈ <strong>${finalWeight.toFixed(3).replace('.', ',')} kg</strong>`;
        } else {
            weightDisplay.innerHTML = '';
        }

        subtotal = finalWeight * product.price;

        document.getElementById('labelSubtotal').innerText = formatCurrency(subtotal);
        document.getElementById('labelShipping').innerText = formatCurrency(shippingCost);
        document.getElementById('labelTotal').innerText = formatCurrency(subtotal + shippingCost);
    }

    // Listeners manuais
    document.getElementById('shippingCost').addEventListener('input', updateValues);
    document.getElementById('orderUnitPrice').addEventListener('input', updateValues);

    // ===== SUBMISSÃO DO PEDIDO =====
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1. Coletar dados
        const data = {
            orderId: Math.floor(Math.random() * 90000) + 10000,
            product: document.getElementById('orderProduct').value,
            color: document.getElementById('orderColor').value,
            quantity: document.getElementById('orderQuantity').value,
            unit: document.getElementById('orderUnit').value,
            unitPrice: document.getElementById('orderUnitPrice').value,
            subtotal: document.getElementById('labelSubtotal').innerText,
            shipping: document.getElementById('labelShipping').innerText,
            total: document.getElementById('labelTotal').innerText,

            clientName: document.getElementById('clientName').value,
            clientTaxId: document.getElementById('clientTaxId').value,
            clientPhone: document.getElementById('clientPhone').value,
            clientEmail: document.getElementById('clientEmail').value,

            address: {
                street: document.getElementById('addrStreet').value,
                number: document.getElementById('addrNumber').value,
                complement: document.getElementById('addrComplement').value,
                neighborhood: document.getElementById('addrNeighborhood').value,
                city: document.getElementById('addrCity').value,
                uf: document.getElementById('addrUF').value,
                zip: document.getElementById('addrZip').value
            },

            shippingMethod: document.getElementById('shippingMethod').value,
            payment: document.querySelector('input[name="payment"]:checked').value
        };

        // 2. Formatar mensagem (Modelo Exato)
        const message = `🧵 *RESUMO DO PEDIDO*

Pedido nº: *#${data.orderId}*

*Produto:* ${data.product}
*Tipo / Composição:* ${data.product === 'Malha PV' ? 'Polyester com Elastano' : (data.product === 'Malha PP' ? '100% Polipropileno' : 'Tecido Técnico')}
*Cor / Estampa:* ${data.color}

*Quantidade:*
☑ ${data.quantity} ${data.unit}

*Valor do item:* ${data.unitPrice}

👤 *DADOS DO CLIENTE*

*Nome completo:* ${data.clientName}
*CPF / CNPJ:* ${data.clientTaxId}
*Telefone / WhatsApp:* ${data.clientPhone}
*E-mail:* ${data.clientEmail}

📧 *Este e-mail será utilizado para:*
☑ Envio da nota fiscal
☑ Atualizações sobre o pedido
☑ Envio do código de rastreamento

📍 *ENDEREÇO DE ENTREGA*

*Endereço:* ${data.address.street}
*Número:* ${data.address.number}
*Complemento:* ${data.address.complement || '-'}
*Bairro:* ${data.address.neighborhood}
*Cidade / UF:* ${data.address.city} / ${data.address.uf}
*CEP:* ${data.address.zip}

📦 Realizamos entregas para todo o território nacional.

🚚 *ENVIO*

*Forma de envio:* ${data.shippingMethod}
*Valor estimado:* ${data.shipping}

🧾 *NOTA FISCAL*

*E-mail para NF:* ${data.clientEmail}
A nota fiscal será emitida após a confirmação do pagamento.

💰 *RESUMO DOS VALORES*

*Subtotal:* ${data.subtotal}
*Frete:* ${data.shipping}

➡️ *TOTAL DO PEDIDO:* *${data.total}*

💳 *PAGAMENTO*

*Forma de pagamento:*
☑ ${data.payment}

*Status:* Aguardando confirmação

📌 *INFORMAÇÕES IMPORTANTES*
O pedido será preparado após a confirmação do pagamento.
Agradecemos pela confiança! 🧵💙`;

        // 3. Gerar link e redirecionar
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${companyConfig.phone}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        orderModal.hide();
    });
});
