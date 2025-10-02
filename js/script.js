// ===== SCRIPT.JS - Página Inicial NYW MALHAS =====

document.addEventListener('DOMContentLoaded', function() {

    // ===== OCULTAR TODAS AS SEÇÕES DE PRODUTOS NA PÁGINA INICIAL =====
    const productSections = document.querySelectorAll('.product-section');
    productSections.forEach(section => {
        section.style.display = 'none';
    });

    // ===== CRIAR SEÇÃO DE BOAS-VINDAS =====
    const main = document.querySelector('main');

    const welcomeSection = document.createElement('section');
    welcomeSection.className = 'welcome-section';
    welcomeSection.innerHTML = `
        <div class="welcome-hero">
            <h1 class="welcome-title">Bem-vindo à NYW MALHAS</h1>
            <p class="welcome-subtitle">Fornecedora de tecidos técnicos de alta qualidade</p>
            <div class="welcome-features">
                <div class="feature-card">
                    <i class="fas fa-award"></i>
                    <h3>Qualidade Premium</h3>
                    <p>Tecidos selecionados e testados</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-truck"></i>
                    <h3>Entrega Rápida</h3>
                    <p>Logística eficiente e segura</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-handshake"></i>
                    <h3>Atendimento Personalizado</h3>
                    <p>Suporte completo para seu negócio</p>
                </div>
            </div>
        </div>
        
        <div class="products-overview">
            <h2>Nossos Produtos</h2>
            <div class="products-grid-home">
                <a href="malha-pv.html" class="product-card-home">
                    <div class="card-icon">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <h3>Malha PV</h3>
                    <p>96% Poliéster / 4% Elastano</p>
                    <span class="card-link">Ver Produtos <i class="fas fa-arrow-right"></i></span>
                </a>
                
                <a href="malha-pp.html" class="product-card-home">
                    <div class="card-icon">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3>Malha PP</h3>
                    <p>100% Poliéster</p>
                    <span class="card-link">Ver Produtos <i class="fas fa-arrow-right"></i></span>
                </a>
                
                <a href="malha-piquet.html" class="product-card-home">
                    <div class="card-icon">
                        <i class="fas fa-chess-board"></i>
                    </div>
                    <h3>Malha Piquet</h3>
                    <p>Textura clássica e elegante</p>
                    <span class="card-link">Ver Produtos <i class="fas fa-arrow-right"></i></span>
                </a>
                
                <a href="helanca-light.html" class="product-card-home">
                    <div class="card-icon">
                        <i class="fas fa-wind"></i>
                    </div>
                    <h3>Helanca Light</h3>
                    <p>92% Poliamida / 8% Elastano</p>
                    <span class="card-link">Ver Produtos <i class="fas fa-arrow-right"></i></span>
                </a>
            </div>
        </div>
        
        <div class="cta-home">
            <h2>Pronto para fazer seu pedido?</h2>
            <p>Entre em contato conosco e solicite um orçamento personalizado</p>
            <a href="contato.html" class="cta-button">
                <i class="fas fa-phone-alt"></i> Falar com Especialista
            </a>
        </div>
    `;

    main.insertBefore(welcomeSection, main.firstChild);

    // ===== ADICIONAR ESTILOS DINÂMICOS =====
    const style = document.createElement('style');
    style.textContent = `
        .welcome-section {
            animation: fadeIn 0.8s ease;
        }
        
        .welcome-hero {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-medium) 100%);
            border-radius: 20px;
            border: 2px solid var(--primary);
            margin-bottom: 4rem;
            box-shadow: 0 10px 40px var(--shadow);
        }
        
        .welcome-title {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: slideDown 0.8s ease;
        }
        
        .welcome-subtitle {
            font-size: 1.3rem;
            color: var(--text-secondary);
            margin-bottom: 3rem;
            animation: slideDown 0.8s ease 0.2s both;
        }
        
        .welcome-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .feature-card {
            padding: 2rem;
            background: var(--bg-dark);
            border-radius: 15px;
            border: 2px solid var(--border);
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease backwards;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.3s; }
        .feature-card:nth-child(2) { animation-delay: 0.4s; }
        .feature-card:nth-child(3) { animation-delay: 0.5s; }
        
        .feature-card:hover {
            border-color: var(--primary);
            transform: translateY(-10px);
            box-shadow: 0 10px 30px var(--glow);
        }
        
        .feature-card i {
            font-size: 3rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .feature-card h3 {
            color: var(--primary);
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }
        
        .feature-card p {
            color: var(--text-secondary);
        }
        
        .products-overview {
            margin-bottom: 4rem;
        }
        
        .products-overview h2 {
            text-align: center;
            font-size: 2.5rem;
            color: var(--primary);
            margin-bottom: 3rem;
        }
        
        .products-grid-home {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
        }
        
        .product-card-home {
            background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-medium) 100%);
            padding: 2.5rem 2rem;
            border-radius: 15px;
            border: 2px solid var(--border);
            text-align: center;
            text-decoration: none;
            color: var(--text-primary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 5px 20px var(--shadow);
        }
        
        .product-card-home:hover {
            border-color: var(--primary);
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 15px 40px var(--glow);
        }
        
        .product-card-home .card-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .product-card-home:hover .card-icon {
            transform: rotate(360deg) scale(1.1);
        }
        
        .product-card-home .card-icon i {
            font-size: 2.5rem;
            color: white;
        }
        
        .product-card-home h3 {
            color: var(--primary);
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .product-card-home p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        .product-card-home .card-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            font-weight: 600;
            transition: gap 0.3s ease;
        }
        
        .product-card-home:hover .card-link {
            gap: 1rem;
        }
        
        .cta-home {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            border-radius: 20px;
            box-shadow: 0 10px 40px var(--shadow);
        }
        
        .cta-home h2 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .cta-home p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        
        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: white;
            color: var(--primary);
            padding: 1.2rem 3rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            gap: 1rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
            .welcome-title {
                font-size: 2rem;
            }
            
            .welcome-subtitle {
                font-size: 1.1rem;
            }
            
            .welcome-features {
                grid-template-columns: 1fr;
            }
            
            .products-grid-home {
                grid-template-columns: 1fr;
            }
            
            .cta-home h2 {
                font-size: 1.8rem;
            }
        }
    `;
    document.head.appendChild(style);
});