/**
 * CONTACT-LOADER.JS - Sistema Anti-Flicker Definitivo
 * Atualização suave com transições CSS controladas
 */

let contactLoadInterval = null;
const elementCache = new Map();
let isFirstLoad = true;

/**
 * Carrega informações de contato do IndexedDB
 */
async function loadContactFromAdmin() {
    if (!window.DBManager) {
        return;
    }

    try {
        if (!window.DBManager.ready) {
            await window.DBManager.init();
        }

        const contactInfo = await window.DBManager.getContact();

        if (!contactInfo) {
            return;
        }

        // Na primeira carga, atualiza imediatamente
        if (isFirstLoad) {
            updateContactInfo(contactInfo);
            isFirstLoad = false;
        } else {
            // Nas próximas, usa transição suave
            updateContactInfoSmooth(contactInfo);
        }
    } catch (error) {
        console.error('Erro ao carregar contato:', error);
    }
}

/**
 * Atualiza com fade suave (apenas se mudou)
 */
function updateContactInfoSmooth(info) {
    const elementsToUpdate = [];

    // Coleta todos os elementos que precisam ser atualizados
    checkAndCollect('[data-contact="email"]', info.email, elementsToUpdate, (el, value) => {
        if (el.tagName === 'A') {
            return { href: `mailto:${value}`, text: value };
        }
        return { text: value };
    });

    checkAndCollect('[data-contact="phone"]', info.phone, elementsToUpdate, (el, value) => {
        if (el.tagName === 'A') {
            const phoneClean = value.replace(/\D/g, '');
            return { href: `tel:+55${phoneClean}`, text: value };
        }
        return { text: value };
    });

    checkAndCollect('[data-contact="whatsapp"]', info.whatsapp, elementsToUpdate, (el, value) => {
        if (el.tagName === 'A') {
            const phoneClean = value.replace(/\D/g, '');
            return { href: `https://wa.me/${phoneClean}`, text: value };
        }
        return { text: value };
    });

    // Se há mudanças, aplica transição suave
    if (elementsToUpdate.length > 0) {
        applyFadeTransition(elementsToUpdate, () => {
            updateContactInfo(info);
        });
    }
}

/**
 * Verifica e coleta elementos que precisam atualizar
 */
function checkAndCollect(selector, newValue, collection, formatter) {
    document.querySelectorAll(selector).forEach(el => {
        const cacheKey = getCacheKey(el, 'text');
        const cachedValue = elementCache.get(cacheKey);

        if (cachedValue !== newValue) {
            const updates = formatter(el, newValue);
            collection.push({ element: el, updates });
        }
    });
}

/**
 * Aplica transição de fade suave
 */
function applyFadeTransition(elements, callback) {
    // Fase 1: Fade out (opacity 0)
    elements.forEach(({ element }) => {
        element.style.transition = 'opacity 0.15s ease-out';
        element.style.opacity = '0';
    });

    // Fase 2: Atualiza conteúdo (após fade out)
    setTimeout(() => {
        callback();

        // Fase 3: Fade in (opacity 1)
        setTimeout(() => {
            elements.forEach(({ element }) => {
                element.style.opacity = '1';

                // Remove transition inline após animação
                setTimeout(() => {
                    element.style.transition = '';
                }, 150);
            });
        }, 50);
    }, 150);
}

/**
 * Gera chave única para cache de elemento
 */
function getCacheKey(element, property) {
    if (!element.dataset.cacheId) {
        element.dataset.cacheId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return `${element.dataset.cacheId}_${property}`;
}

/**
 * Atualiza elemento com cache inteligente
 */
function updateElementSafe(element, property, newValue) {
    const cacheKey = getCacheKey(element, property);
    const cachedValue = elementCache.get(cacheKey);

    if (cachedValue !== newValue) {
        if (property === 'textContent') {
            element.textContent = newValue;
        } else if (property === 'innerHTML') {
            element.innerHTML = newValue;
        } else if (property === 'href') {
            element.href = newValue;
        }
        elementCache.set(cacheKey, newValue);
    }
}

/**
 * Atualiza todos os elementos (usado internamente)
 */
function updateContactInfo(info) {
    // Emails
    document.querySelectorAll('[data-contact="email"]').forEach(el => {
        if (el.tagName === 'A') {
            updateElementSafe(el, 'href', `mailto:${info.email}`);
            // Só atualiza texto se não tiver ícone (previne apagar ícones no rodapé)
            if (!el.querySelector('i')) {
                updateElementSafe(el, 'textContent', info.email);
            }
        } else {
            updateElementSafe(el, 'textContent', info.email);
        }
    });

    // Telefones
    document.querySelectorAll('[data-contact="phone"]').forEach(el => {
        if (el.tagName === 'A') {
            const phoneClean = info.phone.replace(/\D/g, '');
            updateElementSafe(el, 'href', `tel:+55${phoneClean}`);
            if (!el.querySelector('i')) {
                updateElementSafe(el, 'textContent', info.phone);
            }
        } else {
            updateElementSafe(el, 'textContent', info.phone);
        }
    });

    // WhatsApp (texto)
    document.querySelectorAll('[data-contact="whatsapp"]').forEach(el => {
        if (el.tagName === 'A') {
            const phoneClean = info.whatsapp.replace(/\D/g, '');
            updateElementSafe(el, 'href', `https://wa.me/${phoneClean}`);
            // IMPORTANTE: Se for um link de ícone no rodapé, NÃO sobrescrever com texto
            if (!el.querySelector('i')) {
                updateElementSafe(el, 'textContent', info.whatsapp);
            }
        } else {
            updateElementSafe(el, 'textContent', info.whatsapp);
        }
    });

    // Botões WhatsApp
    document.querySelectorAll('[data-whatsapp]').forEach(btn => {
        const phoneClean = info.whatsapp.replace(/\D/g, '');
        const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos NYW MALHAS.');
        const newHref = `https://wa.me/${phoneClean}?text=${message}`;

        if (btn.tagName === 'A') {
            updateElementSafe(btn, 'href', newHref);
        } else {
            const cacheKey = getCacheKey(btn, 'onclick');
            const cachedHref = elementCache.get(cacheKey);

            if (cachedHref !== newHref) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    window.open(newHref, '_blank');
                };
                elementCache.set(cacheKey, newHref);
            }
        }
    });

    // Endereços
    document.querySelectorAll('[data-contact="address"]').forEach(el => {
        if (el.innerHTML.includes('<br>') || el.querySelector('br')) {
            const newContent = info.address.replace(/\n/g, '<br>');
            updateElementSafe(el, 'innerHTML', newContent);
        } else {
            updateElementSafe(el, 'textContent', info.address);
        }
    });

    // Horários
    document.querySelectorAll('[data-contact="hours"]').forEach(el => {
        if (el.innerHTML.includes('<br>') || el.querySelector('br')) {
            const newContent = info.hours.replace(/\n/g, '<br>');
            updateElementSafe(el, 'innerHTML', newContent);
        } else {
            updateElementSafe(el, 'textContent', info.hours);
        }
    });

    // Facebook
    document.querySelectorAll('[data-contact="facebook"]').forEach(el => {
        if (el.tagName === 'A') {
            updateElementSafe(el, 'href', info.facebook);
        } else {
            updateElementSafe(el, 'textContent', info.facebook);
        }
    });

    // Instagram
    document.querySelectorAll('[data-contact="instagram"]').forEach(el => {
        const instagramUrl = info.instagram.startsWith('@')
            ? `https://instagram.com/${info.instagram.substring(1)}`
            : `https://instagram.com/${info.instagram}`;

        if (el.tagName === 'A') {
            updateElementSafe(el, 'href', instagramUrl);
        } else {
            updateElementSafe(el, 'textContent', info.instagram);
        }
    });

    // Links de redes sociais
    updateSocialLinks(info);
}

/**
 * Atualiza links de redes sociais
 */
function updateSocialLinks(info) {
    document.querySelectorAll('.social-links a, .social-card').forEach(link => {
        const icon = link.querySelector('i');
        if (!icon) return;

        let newHref = '';

        if (icon.classList.contains('fa-facebook')) {
            newHref = info.facebook || '#';
        } else if (icon.classList.contains('fa-instagram')) {
            newHref = info.instagram.startsWith('@')
                ? `https://instagram.com/${info.instagram.substring(1)}`
                : `https://instagram.com/${info.instagram}`;
        } else if (icon.classList.contains('fa-whatsapp')) {
            const phoneClean = info.whatsapp.replace(/\D/g, '');
            newHref = `https://wa.me/${phoneClean}`;
        }

        if (newHref) {
            updateElementSafe(link, 'href', newHref);
        }
    });
}

/**
 * Inicia auto-refresh
 */
function startContactAutoRefresh() {
    if (contactLoadInterval) {
        clearInterval(contactLoadInterval);
    }

    contactLoadInterval = setInterval(() => {
        loadContactFromAdmin();
    }, 3000);
}

/**
 * Para o auto-refresh
 */
function stopContactAutoRefresh() {
    if (contactLoadInterval) {
        clearInterval(contactLoadInterval);
        contactLoadInterval = null;
    }
}

/**
 * Inicializa o carregamento
 */
async function initContactLoader() {
    if (!window.DBManager) {
        setTimeout(initContactLoader, 100);
        return;
    }

    try {
        await window.DBManager.init();
        await loadContactFromAdmin();
        startContactAutoRefresh();
    } catch (error) {
        console.error('Erro ao inicializar contato:', error);
    }
}

// Adiciona estilos CSS para garantir transições suaves
const style = document.createElement('style');
style.textContent = `
    [data-contact],
    [data-whatsapp],
    .social-links a,
    .social-card {
        will-change: opacity;
    }
`;
document.head.appendChild(style);

// Inicializa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactLoader);
} else {
    initContactLoader();
}

window.addEventListener('beforeunload', stopContactAutoRefresh);

// Exporta para uso externo
window.ContactLoader = {
    reload: loadContactFromAdmin,
    startAutoRefresh: startContactAutoRefresh,
    stopAutoRefresh: stopContactAutoRefresh
};