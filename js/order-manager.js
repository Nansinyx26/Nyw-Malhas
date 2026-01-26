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
        'malha-pv': { name: 'Malha PV', unit: 'Kg', weightFactor: 0.33 },
        'malha-pp': { name: 'Malha PP', unit: 'Kg', weightFactor: 0.25 },
        'malha-piquet': { name: 'Malha Piquet', unit: 'Kg', weightFactor: 0.35 },
        'helanca-light': { name: 'Helanca Light', unit: 'Kg', weightFactor: 0.20 },
        'dry-fit': { name: 'Dry Fit', unit: 'Kg', weightFactor: 0.25 },
        'viscose': { name: 'Viscose c/ Elastano', unit: 'Kg', weightFactor: 0.35 },
        'moletom': { name: 'Moletom', unit: 'Kg', weightFactor: 0.60 },
        'helanca-escolar': { name: 'Helanca Escolar', unit: 'Kg', weightFactor: 0.40 },
        'algodao': { name: 'Algodão', unit: 'Kg', weightFactor: 0.30 },
        'oxford': { name: 'Oxford', unit: 'Kg', weightFactor: 0.25 }
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



    // ===== ABRIR MODAL =====
    window.openOrderModal = async function (product, color) {
        document.getElementById('orderProduct').value = product;

        // Cor padrão se não fornecida
        const selectedColor = color || window.checkoutColorName || 'Selecione abaixo';
        document.getElementById('orderColor').value = selectedColor;

        // Buscar estoque e PREÇO do banco se disponível
        let stockValue = '...';
        let dynamicPrice = null;

        if (window.DBManager) {
            try {
                const allProducts = await window.DBManager.getAllProducts();
                const dbProduct = allProducts.find(p => {
                    const pName = p.name.toLowerCase();
                    const pColor = p.color.toLowerCase();
                    const searchName = product.toLowerCase();

                    // Matching inteligente: mesma cor E (nome igual OU um contém o outro OU categoria bate)
                    const colorMatch = pColor === selectedColor.toLowerCase();
                    const nameMatch = pName.includes(searchName) || searchName.includes(pName);

                    // Fallback para categorias comuns (Ex: Algodão -> Meia Malha)
                    let catMatch = false;
                    if (searchName.includes('algodão') || searchName.includes('algodao')) {
                        catMatch = pName.includes('meia malha');
                    }
                    if (searchName.includes('pv')) catMatch = pName.includes('pv');
                    if (searchName.includes('pp')) catMatch = pName.includes('pp');

                    return colorMatch && (nameMatch || catMatch);
                });

                if (dbProduct) {
                    stockValue = dbProduct.stock || 0;

                    // ✅ PREVENÇÃO DE VENDA: Bloquear modal se estoque = 0
                    if (stockValue <= 0) {
                        alert('Produto indisponível no momento.\n\nEste item não está disponível para venda.');
                        return; // Bloqueia a abertura do modal
                    }
                }
            } catch (e) { console.error('Erro ao buscar dados do produto:', e); }
        }

        // Atualizar display de estoque no modal com segurança
        // (Visualização de status removida conforme solicitação)

        // Atualizar imagem no modal
        const productImage = document.getElementById('productImage');
        const modalImage = document.getElementById('modalProductImage');
        if (modalImage) {
            if (window.DBProductImage) {
                modalImage.src = window.DBProductImage;
            } else if (productImage) {
                modalImage.src = productImage.src;
            }
        }

        // Resetar campos com segurança
        const qtyInput = document.getElementById('orderQuantity');
        if (qtyInput) qtyInput.value = '';

        updateValues();
        orderModal.show();
    };

    // ===== ATUALIZAR VALORES TOTAIS =====
    function updateValues() {
        // Lógica de cálculo desativada conforme solicitado
    }

    // Listeners manusias com proteção contra nulos
    const orderQtyInput = document.getElementById('orderQuantity');
    if (orderQtyInput) {
        orderQtyInput.addEventListener('input', updateValues);
    }

    // ===== SUBMISSÃO DO PEDAMENTO =====
    orderForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 1. Coletar dados
        const data = {
            orderId: Math.floor(Math.random() * 90000) + 10000,
            product: document.getElementById('orderProduct').value,
            color: document.getElementById('orderColor').value,
            quantity: document.getElementById('orderQuantity').value,
            unit: document.getElementById('orderUnit').value,

            clientName: document.getElementById('clientName').value,
            clientTaxId: document.getElementById('clientTaxId').value,
            clientPhone: document.getElementById('clientPhone').value,
            clientEmail: document.getElementById('clientEmail').value,

            address: {
                street: document.getElementById('addrStreet').value,
                number: document.getElementById('addrNumber').value,
                complement: document.getElementById('addrComplement').value || '',
                neighborhood: document.getElementById('addrNeighborhood').value,
                city: document.getElementById('addrCity').value,
                uf: document.getElementById('addrUF').value,
                zip: document.getElementById('addrZip').value
            }
        };

        // ✅ Tentar salvar na API, mas não travar se falhar
        let apiOrderNumber = null;
        try {
            if (window.APIClient && window.DBManager) {
                const products = await window.DBManager.getAllProducts();
                const productMatch = products.find(p =>
                    p.name.toLowerCase().includes(data.product.split(' ')[0].toLowerCase()) &&
                    p.color.toLowerCase() === data.color.toLowerCase()
                );

                if (productMatch) {
                    const orderPayload = {
                        customer: {
                            name: data.clientName,
                            email: data.clientEmail,
                            phone: data.clientPhone,
                            taxId: data.clientTaxId
                        },
                        items: [{
                            productId: productMatch._id,
                            productName: productMatch.name,
                            color: data.color,
                            quantity: parseFloat(data.quantity),
                            unit: data.unit,
                            unitPrice: 0,
                            subtotal: 0 // Simulado
                        }],
                        shipping: {
                            method: "A combinar",
                            cost: 0,
                            address: data.address
                        },
                        payment: { method: "WhatsApp" },
                        total: 0
                    };

                    const orderResponse = await window.APIClient.post('/orders', orderPayload);
                    if (orderResponse && orderResponse.success) {
                        apiOrderNumber = orderResponse.data.orderNumber;
                        console.log(`✅ Pedido salvo na API: ${apiOrderNumber}`);
                    }
                }
            }
        } catch (apiError) {
            console.warn('⚠️ Erro ao salvar pedido na API:', apiError);
            // Prossiga silenciosamente para o WhatsApp
        }

        // 2. Formatar mensagem (Modelo Exato)
        const getComposition = (product) => {
            const p = product.toLowerCase();
            if (p.includes('pv')) return 'Polyester com Elastano';
            if (p.includes('pp')) return '100% Polipropileno';
            if (p.includes('piquet')) return '65% PES / 35% ALG';
            if (p.includes('dry')) return '100% Poliamida';
            if (p.includes('viscose')) return '96% Viscose / 4% Elastano';
            if (p.includes('moletom')) return '50% ALG / 50% PES';
            if (p.includes('algodão') || p.includes('algodao')) return '100% Algodão Penteado';
            if (p.includes('helanca')) return '100% Poliéster';
            if (p.includes('oxford')) return '100% Poliéster';
            return 'Tecido Técnico';
        };

        const message = `🧵 *DADOS DO PEDIDO*

Pedido nº: *#${apiOrderNumber || data.orderId}*

*Produto:* ${data.product}
*Tipo / Composição:* ${getComposition(data.product)}
*Cor / Estampa:* ${data.color}

*Quantidade:*
☑ ${data.quantity} ${data.unit}

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
Aguardando cotação de frete personalizada.

🧾 *NOTA FISCAL*
*E-mail para NF:* ${data.clientEmail}
A nota fiscal será emitida após a confirmação do pedido e pagamento.

*Status:* ${apiOrderNumber ? 'Registrado no sistema' : 'Aguardando conferência'}

📌 *INFORMAÇÕES IMPORTANTES*
Agradecemos pela confiança! 🧵💙`;

        // 3. Gerar link e redirecionar
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${companyConfig.phone}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        orderModal.hide();
    });
});
