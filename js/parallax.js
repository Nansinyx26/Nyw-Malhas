// ===== PARALLAX.JS - Efeitos de Parallax e Glassmorphism =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== PARALLAX SCROLL EFFECT =====
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    // Elementos parallax
    const parallaxElements = {
        header: document.querySelector('header'),
        logo: document.querySelector('.logo'),
        sections: document.querySelectorAll('.product-section'),
        cards: document.querySelectorAll('.info-card, .color-selector, .specifications')
    };
    
    // Função de parallax otimizada com requestAnimationFrame
    function updateParallax() {
        const scrollY = window.scrollY;
        const scrollPercent = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Parallax no header
        if (parallaxElements.header) {
            const headerSpeed = 0.5;
            parallaxElements.header.style.transform = `translateY(${scrollY * headerSpeed}px)`;
        }
        
        // Parallax no logo (efeito flutuante baseado no scroll)
        if (parallaxElements.logo) {
            const logoSpeed = 0.3;
            const logoRotation = scrollPercent * 5; // Rotação sutil
            parallaxElements.logo.style.transform = `translateY(${scrollY * logoSpeed}px) rotate(${logoRotation}deg)`;
        }
        
        // Parallax nas seções (efeito de profundidade)
        parallaxElements.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;
            const viewportMiddle = window.innerHeight / 2;
            const distance = sectionMiddle - viewportMiddle;
            const parallaxSpeed = 0.1;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.style.transform = `translateY(${distance * parallaxSpeed}px)`;
            }
        });
        
        // Efeito parallax nos cards (movimento sutil)
        parallaxElements.cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const cardMiddle = rect.top + rect.height / 2;
                const viewportMiddle = window.innerHeight / 2;
                const distance = (cardMiddle - viewportMiddle) / 50;
                card.style.transform = `translateY(${distance}px) scale(${1 + Math.abs(distance) * 0.0001})`;
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // Event listener para scroll com throttle
    window.addEventListener('scroll', requestTick, { passive: true });
    
    
    // ===== NAVEGAÇÃO GLASSMORPHISM DINÂMICA =====
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Adicionar classe 'scrolled' quando rolar
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
    
    
    // ===== PARALLAX NO MOUSE (Cards 3D) =====
    const productCards = document.querySelectorAll('.product-card-home, .info-card, .image-container');
    
    productCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
    
    
    // ===== INTERSECTION OBSERVER PARA ANIMAÇÕES =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const fadeInElements = document.querySelectorAll('.product-section, .info-card, .color-selector, .specifications');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeInElements.forEach(el => fadeInObserver.observe(el));
    
    
    // ===== EFEITO GLASS DINÂMICO ===== 
    // Ajusta a intensidade do blur baseado na velocidade do scroll
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();
    
    window.addEventListener('scroll', () => {
        const now = Date.now();
        const timeDiff = now - lastScrollTime;
        const scrollDiff = Math.abs(window.scrollY - lastScroll);
        
        scrollVelocity = scrollDiff / timeDiff;
        
        // Aumenta o blur durante scroll rápido
        const blurAmount = Math.min(20 + scrollVelocity * 10, 40);
        if (nav) {
            nav.style.backdropFilter = `blur(${blurAmount}px) saturate(180%)`;
            nav.style.webkitBackdropFilter = `blur(${blurAmount}px) saturate(180%)`;
        }
        
        lastScrollTime = now;
    }, { passive: true });
    
    
    // ===== PERFORMANCE: WILL-CHANGE OPTIMIZATION =====
    // Adiciona will-change apenas durante a interação
    const optimizePerformance = () => {
        const allAnimatedElements = document.querySelectorAll('.parallax-layer, .nav-link, .color-swatch, .image-container');
        
        allAnimatedElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.willChange = 'transform, opacity';
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.willChange = 'auto';
            });
        });
    };
    
    optimizePerformance();
    
    
    // ===== PARALLAX INICIAL =====
    updateParallax();
    
    console.log('✨ Parallax e Glassmorphism carregados!');
});


// ===== SMOOTH SCROLL PARA LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
