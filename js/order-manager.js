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

    // ===== MÁSCARAS DE ENTRADA =====
    const taxIdInput = document.getElementById('clientTaxId');
    const phoneInput = document.getElementById('clientPhone');

    function maskTaxId(value) {
        const d = value.replace(/\D/g, '').slice(0, 14);
        if (d.length <= 11) {
            // CPF: 000.000.000-00
            return d
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        // CNPJ: 00.000.000/0000-00
        return d
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }

    function maskPhone(value) {
        const d = value.replace(/\D/g, '').slice(0, 11);
        if (d.length <= 10) {
            return d
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
        }
        return d
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }

    if (taxIdInput) {
        taxIdInput.addEventListener('input', (e) => { e.target.value = maskTaxId(e.target.value); });
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => { e.target.value = maskPhone(e.target.value); });
    }

    // ===== VALIDAÇÃO AMIGÁVEL EM TEMPO REAL =====
    function isValidCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
        let d1 = (sum * 10) % 11; if (d1 === 10) d1 = 0;
        if (d1 !== parseInt(cpf[9])) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
        let d2 = (sum * 10) % 11; if (d2 === 10) d2 = 0;
        return d2 === parseInt(cpf[10]);
    }

    function isValidCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
        const calc = (len) => {
            let sum = 0, pos = len - 7;
            for (let i = len; i >= 1; i--) {
                sum += parseInt(cnpj[len - i]) * pos--;
                if (pos < 2) pos = 9;
            }
            const r = sum % 11;
            return r < 2 ? 0 : 11 - r;
        };
        return calc(12) === parseInt(cnpj[12]) && calc(13) === parseInt(cnpj[13]);
    }

    function setError(input, msg) {
        if (!input) return;
        input.classList.add('is-invalid');
        let err = input.parentElement.querySelector('.field-error');
        if (!err) {
            err = document.createElement('span');
            err.className = 'field-error';
            input.parentElement.appendChild(err);
        }
        err.textContent = msg;
    }

    function clearError(input) {
        if (!input) return;
        input.classList.remove('is-invalid');
        const err = input.parentElement.querySelector('.field-error');
        if (err) err.textContent = '';
    }

    // Regras por campo. Retorna mensagem de erro ou '' se válido.
    const validators = {
        clientName: (v) => v.trim().length >= 3 ? '' : 'Informe o nome completo.',
        clientTaxId: (v) => {
            const d = v.replace(/\D/g, '');
            if (d.length === 11) return isValidCPF(v) ? '' : 'CPF inválido.';
            if (d.length === 14) return isValidCNPJ(v) ? '' : 'CNPJ inválido.';
            return 'Informe um CPF ou CNPJ válido.';
        },
        clientPhone: (v) => {
            const d = v.replace(/\D/g, '');
            return (d.length === 10 || d.length === 11) ? '' : 'Telefone inválido (com DDD).';
        },
        clientEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'E-mail inválido.',
        orderQuantity: (v) => (parseFloat(v) > 0) ? '' : 'Informe a quantidade.',
        addrStreet: (v) => v.trim() ? '' : 'Informe o endereço.',
        addrNumber: (v) => v.trim() ? '' : 'Nº',
        addrNeighborhood: (v) => v.trim() ? '' : 'Informe o bairro.',
        addrCity: (v) => v.trim() ? '' : 'Informe a cidade.',
        addrUF: (v) => /^[A-Za-z]{2}$/.test(v.trim()) ? '' : 'UF',
        addrZip: (v) => v.replace(/\D/g, '').length === 8 ? '' : 'CEP inválido.'
    };

    function validateField(id) {
        const input = document.getElementById(id);
        if (!input || !validators[id]) return true;
        const msg = validators[id](input.value);
        if (msg) { setError(input, msg); return false; }
        clearError(input);
        return true;
    }

    // Feedback em tempo real (ao sair do campo e ao digitar depois de um erro)
    Object.keys(validators).forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('blur', () => validateField(id));
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) validateField(id);
        });
    });

    function validateAll() {
        let firstInvalid = null;
        Object.keys(validators).forEach((id) => {
            const ok = validateField(id);
            if (!ok && !firstInvalid) firstInvalid = document.getElementById(id);
        });
        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return !firstInvalid;
    }

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

        // 0. Validar antes de prosseguir
        if (!validateAll()) return;

        // Estado de loading no botão de finalizar
        const submitBtn = document.getElementById('orderSubmitBtn');
        if (submitBtn) submitBtn.classList.add('is-loading');

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

        // Encerrar loading e fechar o modal
        if (submitBtn) submitBtn.classList.remove('is-loading');
        orderModal.hide();

        // Abre o WhatsApp e mostra a confirmação com o mascote 👍
        window.open(whatsappUrl, '_blank');
        if (window.NYWMascote && typeof window.NYWMascote.celebrate === 'function') {
            window.NYWMascote.celebrate();
        }
    });
});
