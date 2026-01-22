// ===== SHIPPING-RATES.JS - Matriz de Fretes (Origem: SP/Interior) =====

/**
 * Matriz de Fretes Realista (Estimativa 2025/2026)
 * Origem: Interior de São Paulo (Americana/Campinas - Polo Têxtil)
 * Estrutura: UF: { pac: {base, kg}, sedex: {base, kg}, prazoPac, prazoSedex }
 * kg = Custo adicional por Kg (estimado)
 */
const SHIPPING_MATRIX = {
    // SUDESTE
    'SP': { pac: { base: 22.90, kg: 1.50 }, sedex: { base: 28.50, kg: 2.10 }, daysPac: '5-7', daysSedex: '2-3' },
    'RJ': { pac: { base: 26.50, kg: 1.80 }, sedex: { base: 42.90, kg: 2.50 }, daysPac: '6-8', daysSedex: '3-4' },
    'MG': { pac: { base: 25.90, kg: 1.70 }, sedex: { base: 39.90, kg: 2.40 }, daysPac: '6-9', daysSedex: '3-5' },
    'ES': { pac: { base: 32.50, kg: 2.10 }, sedex: { base: 55.20, kg: 3.20 }, daysPac: '7-10', daysSedex: '4-6' },

    // SUL
    'PR': { pac: { base: 28.90, kg: 1.90 }, sedex: { base: 45.50, kg: 2.80 }, daysPac: '6-9', daysSedex: '3-5' },
    'SC': { pac: { base: 34.90, kg: 2.20 }, sedex: { base: 58.90, kg: 3.50 }, daysPac: '7-11', daysSedex: '4-7' },
    'RS': { pac: { base: 36.90, kg: 2.40 }, sedex: { base: 62.50, kg: 3.80 }, daysPac: '8-12', daysSedex: '5-8' },

    // CENTRO-OESTE
    'DF': { pac: { base: 32.90, kg: 2.30 }, sedex: { base: 52.90, kg: 3.90 }, daysPac: '6-9', daysSedex: '3-5' },
    'GO': { pac: { base: 35.50, kg: 2.40 }, sedex: { base: 58.90, kg: 4.10 }, daysPac: '7-10', daysSedex: '4-6' },
    'MS': { pac: { base: 38.90, kg: 2.50 }, sedex: { base: 65.50, kg: 4.50 }, daysPac: '7-11', daysSedex: '5-7' },
    'MT': { pac: { base: 45.90, kg: 3.10 }, sedex: { base: 78.90, kg: 5.50 }, daysPac: '9-14', daysSedex: '6-9' },

    // NORDESTE
    'BA': { pac: { base: 42.50, kg: 2.80 }, sedex: { base: 75.90, kg: 5.20 }, daysPac: '8-13', daysSedex: '5-8' },
    'PE': { pac: { base: 55.90, kg: 3.50 }, sedex: { base: 89.90, kg: 6.50 }, daysPac: '10-15', daysSedex: '6-9' },
    'CE': { pac: { base: 58.90, kg: 3.70 }, sedex: { base: 92.50, kg: 6.80 }, daysPac: '11-16', daysSedex: '6-10' },
    'default': { pac: { base: 65.00, kg: 4.50 }, sedex: { base: 98.00, kg: 7.50 }, daysPac: '12-18', daysSedex: '7-12' }
};

/**
 * Calcula o frete baseado na matriz
 * @param {string} uf - Estado (UF)
 * @param {number} quantity - Quantidade
 * @param {string} unit - Unidade ('metro(s)' ou 'quilo(s)')
 * @returns {object} - { pac: {price, days}, sedex: {price, days}, weight }
 */
function calculateShippingDetails(uf, quantity, unit) {
    if (!uf) return null;
    uf = uf.toUpperCase();

    // Estimativa de Peso (Malha média ~350g/m linear)
    let weight = quantity;
    if (unit && unit.toLowerCase().includes('metro')) {
        weight = quantity * 0.35;
    }
    // Peso mínimo considerado: 1Kg
    weight = Math.max(weight, 1);

    // Pegar taxa da UF ou Default (Norte/Nordeste/Outros)
    const rate = SHIPPING_MATRIX[uf] || SHIPPING_MATRIX['default'];

    // Cálculo PAC
    const pacBase = rate.pac.base;
    const pacExtra = (weight - 1) * rate.pac.kg; // Cobrança por Kg excedente
    const pacPrice = pacBase + Math.max(0, pacExtra);

    // Cálculo SEDEX
    const sedexBase = rate.sedex.base;
    const sedexExtra = (weight - 1) * rate.sedex.kg;
    const sedexPrice = sedexBase + Math.max(0, sedexExtra);

    return {
        pac: {
            price: pacPrice,
            days: rate.daysPac,
            formatted: `R$ ${pacPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        },
        sedex: {
            price: sedexPrice,
            days: rate.daysSedex,
            formatted: `R$ ${sedexPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        },
        weight: weight.toFixed(2)
    };
}
