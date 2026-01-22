// ===== GALLERY.JS - Interactive Product Gallery =====

document.addEventListener('DOMContentLoaded', function() {

    // ===== IMAGE MODAL FUNCTIONALITY =====
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const viewDetailsBtn = card.querySelector('.view-details');
        const cardImage = card.querySelector('.card-image');

        // Click on "Ver Detalhes" button
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openImageModal(card);
            });
        }

        // Click on card image
        if (cardImage) {
            cardImage.addEventListener('click', () => {
                openImageModal(card);
            });
        }
    });

    // ===== OPEN IMAGE MODAL =====
    function openImageModal(card) {
        const cardImage = card.querySelector('.card-image');
        const imageUrl = cardImage.style.backgroundImage.slice(5, -2);
        const title = card.querySelector('h3').textContent;
        const description = card.querySelector('.card-description').textContent;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-image-container">
                    <img src="${imageUrl}" alt="${title}" class="modal-image">
                </div>
                <div class="modal-info">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Animate modal entrance
        setTimeout(() => modal.classList.add('active'), 10);

        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => closeModal(modal));
        overlay.addEventListener('click', () => closeModal(modal));

        // Close on ESC key
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // ===== CLOSE MODAL =====
    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }

    // ===== FILTER FUNCTIONALITY (if filter buttons exist) =====
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter products
                productCards.forEach(card => {
                    const category = card.dataset.category;

                    if (filter === 'all' || category === filter) {
                        card.style.display = '';
                        setTimeout(() => card.classList.add('show'), 10);
                    } else {
                        card.classList.remove('show');
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // ===== SCROLL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.product-card, .tech-specs-section, .applications-section, .cta-section').forEach(el => {
        observer.observe(el);
    });

    // ===== SMOOTH SCROLL FOR CTA BUTTONS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== ADD ANIMATION CLASSES =====
    const style = document.createElement('style');
    style.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .image-modal.active {
            opacity: 1;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            cursor: pointer;
        }
        
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90vh;
            background: var(--bg-light);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .image-modal.active .modal-content {
            transform: scale(1);
        }
        
        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            background: var(--primary);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: var(--primary-light);
            transform: rotate(90deg);
        }
        
        .modal-image-container {
            width: 100%;
            max-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-dark);
            padding: 2rem;
        }
        
        .modal-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 10px;
        }
        
        .modal-info {
            padding: 2rem;
            background: var(--bg-medium);
        }
        
        .modal-info h3 {
            color: var(--primary);
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        
        .modal-info p {
            color: var(--text-secondary);
            line-height: 1.6;
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .modal-content {
                max-width: 95%;
            }
            
            .modal-image-container {
                padding: 1rem;
            }
            
            .modal-info {
                padding: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
});