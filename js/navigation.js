// ===== NAVIGATION.JS - Controle de Navegação Entre Seções =====

document.addEventListener('DOMContentLoaded', function () {

    // Função para mostrar uma seção específica
    window.showProductSection = function (sectionId) {
        // Esconder todas as seções
        document.querySelectorAll('.product-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar apenas a seção desejada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');

            // Rolar suavemente até a seção
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    /* 
    // Interceptar cliques nos cards de produtos - DESATIVADO PARA PERMITIR NAVEGAÇÃO MULTIPÁGINA
    const productCards = document.querySelectorAll('.product-card-home');
    productCards.forEach(card => {
        card.addEventListener('click', function (e) {
            e.preventDefault(); // Impedir navegação para outra página

            // Extrair o produto do link ou data-attribute
            const href = this.getAttribute('href');

            // Mapear URLs para IDs de seção
            const urlToSectionMap = {
                'malha-pv.html': 'section-pv',
                'malha-pp.html': 'section-pp',
                'malha-piquet.html': 'section-piquet',
                'helanca-light.html': 'section-helanca',
                'algodao.html': 'section-algodao'
            };

            // Encontrar o ID da seção baseado no href
            for (const [urlPart, sectionId] of Object.entries(urlToSectionMap)) {
                if (href && href.includes(urlPart)) {
                    showProductSection(sectionId);
                    break;
                }
            }
        });
    });
    */

    /*
    // Interceptar cliques nos links de navegação do topo - DESATIVADO PARA PERMITIR NAVEGAÇÃO MULTIPÁGINA
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Apenas interceptar links de produtos (não contato ou início)
        if (href && (href.includes('malha-') || href.includes('helanca') || href.includes('algodao'))) {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                // Mapear URLs para IDs de seção
                if (href.includes('malha-pv')) {
                    showProductSection('section-pv');
                } else if (href.includes('malha-pp')) {
                    showProductSection('section-pp');
                } else if (href.includes('malha-piquet') || href.includes('piquet')) {
                    showProductSection('section-piquet');
                } else if (href.includes('helanca')) {
                    showProductSection('section-helanca');
                } else if (href.includes('algodao')) {
                    showProductSection('section-algodao');
                }

                // Fechar o menu mobile se estiver aberto
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        }
    });
    */

    // Garantir que a primeira seção (Malha PV) esteja ativa ao carregar
    const firstSection = document.querySelector('.product-section');
    if (!document.querySelector('.product-section.active')) {
        firstSection?.classList.add('active');
    }
});
