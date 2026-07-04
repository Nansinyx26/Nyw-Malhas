// ===== MASCOTE.JS - Interações do mascote NYW e reveal-on-scroll =====
// JS puro, sem dependências. Respeita prefers-reduced-motion.

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------------------------------------------------------------------
    // 1) Reveal on scroll (IntersectionObserver)
    // ---------------------------------------------------------------------
    function initReveal() {
        const items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        // Sem JS/observer ou com reduced-motion: revela tudo de imediato.
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        items.forEach(el => observer.observe(el));
    }

    // ---------------------------------------------------------------------
    // 2) Botão flutuante (FAB) — aceno idle + pulo ao clicar
    // ---------------------------------------------------------------------
    function initFab() {
        const fab = document.getElementById('mascoteWhats');
        if (!fab) return;

        // Aceno automático leve a cada ~8s (só se o usuário permite movimento)
        if (!reduceMotion) {
            setInterval(() => {
                if (document.hidden) return;
                fab.classList.add('is-waving', 'show-balao');
                setTimeout(() => fab.classList.remove('is-waving', 'show-balao'), 1600);
            }, 8000);
        }

        // "Fale no WhatsApp": animação de pulo + segue o href (wa.me) normalmente.
        fab.addEventListener('click', function () {
            if (!reduceMotion) {
                fab.classList.add('is-jumping');
                setTimeout(() => fab.classList.remove('is-jumping'), 420);
            }
        });
    }

    // ---------------------------------------------------------------------
    // 3) Confete de sucesso
    // ---------------------------------------------------------------------
    function fireConfetti() {
        if (reduceMotion) return;
        const colors = ['#ff6600', '#ff8533', '#ffd166', '#ffffff', '#25D366'];
        const total = 70;
        for (let i = 0; i < total; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            const duration = 2 + Math.random() * 1.8;
            piece.style.animationDuration = duration + 's';
            piece.style.animationDelay = (Math.random() * 0.4) + 's';
            piece.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), (duration + 0.6) * 1000);
        }
    }

    // ---------------------------------------------------------------------
    // 4) Overlay de confirmação (pose 👍)
    // ---------------------------------------------------------------------
    function ensureSuccessOverlay() {
        let overlay = document.getElementById('mascoteSuccess');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'mascoteSuccess';
        overlay.className = 'mascote-success';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-live', 'polite');
        overlay.innerHTML =
            '<div class="mascote-success-card">' +
            '  <img src="img/mascote-nyw.png" alt="Mascote NYW comemorando" ' +
            '       onerror="this.onerror=null;this.src=\'img/logo3.webp\';">' +
            '  <h4>Pedido enviado! 🎉</h4>' +
            '  <p>Continue a conversa no WhatsApp para fecharmos tudo 👉</p>' +
            '  <button type="button" class="btn btn-success px-4 fw-bold" data-mascote-close>Ok, entendi</button>' +
            '</div>';
        document.body.appendChild(overlay);

        const close = () => overlay.classList.remove('is-open');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.hasAttribute('data-mascote-close')) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
        return overlay;
    }

    /**
     * Mostra a confirmação com mascote 👍 + confete.
     * @param {string} [imgBase] prefixo de caminho da imagem ('' na raiz, '../' em /paginas)
     */
    function celebrate(imgBase) {
        const overlay = ensureSuccessOverlay();
        if (typeof imgBase === 'string') {
            const img = overlay.querySelector('img');
            if (img) img.src = imgBase + 'img/mascote-nyw.png';
        }
        overlay.classList.add('is-open');
        fireConfetti();
    }

    // ---------------------------------------------------------------------
    // 5) Helpers de estado vazio / loader (usados por loaders de produto)
    // ---------------------------------------------------------------------
    function emptyStateHTML(message, imgBase) {
        const base = imgBase || '';
        return (
            '<div class="mascote-empty">' +
            '  <img src="' + base + 'img/mascote-nyw.png" alt="Mascote NYW" ' +
            '       onerror="this.onerror=null;this.src=\'' + base + 'img/logo3.webp\';">' +
            '  <p>' + (message || 'Ops, não achei essa malha…') + '</p>' +
            '</div>'
        );
    }

    function loaderHTML(imgBase) {
        const base = imgBase || '';
        return (
            '<div class="mascote-empty mascote-loader">' +
            '  <img src="' + base + 'img/mascote-nyw.png" alt="Carregando" ' +
            '       onerror="this.onerror=null;this.src=\'' + base + 'img/logo3.webp\';">' +
            '  <p>Carregando…</p>' +
            '</div>'
        );
    }

    // Exporta API pública
    window.NYWMascote = {
        celebrate: celebrate,
        confetti: fireConfetti,
        emptyStateHTML: emptyStateHTML,
        loaderHTML: loaderHTML,
        reduceMotion: reduceMotion
    };

    // ---------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        initReveal();
        initFab();
    });
})();
