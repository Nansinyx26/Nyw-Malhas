// ===== CONTACT.JS - Contact Page Functionality =====

document.addEventListener('DOMContentLoaded', function() {

    // ===== FORM VALIDATION AND SUBMISSION =====
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const formData = {
                name: document.getElementById('name').value.trim(),
                company: document.getElementById('company').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                product: document.getElementById('product').value,
                message: document.getElementById('message').value.trim()
            };

            // Validate form
            if (validateForm(formData)) {
                handleFormSubmission(formData);
            }
        });
    }

    // ===== FORM VALIDATION =====
    function validateForm(data) {
        let isValid = true;

        // Clear previous errors
        clearErrors();

        // Validate name
        if (data.name.length < 3) {
            showError('name', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('email', 'Email inválido');
            isValid = false;
        }

        // Validate phone
        const phoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
        if (!phoneRegex.test(data.phone)) {
            showError('phone', 'Telefone inválido');
            isValid = false;
        }

        // Validate message
        if (data.message.length < 10) {
            showError('message', 'Mensagem deve ter pelo menos 10 caracteres');
            isValid = false;
        }

        return isValid;
    }

    // ===== SHOW ERROR MESSAGE =====
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');

        // Create error element
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Add error styling
        field.classList.add('error');
        formGroup.appendChild(errorElement);
    }

    // ===== CLEAR ALL ERRORS =====
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    // ===== HANDLE FORM SUBMISSION =====
    function handleFormSubmission(data) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Simulate API call (replace with actual endpoint)
        setTimeout(() => {
            // Success
            showSuccessMessage();
            contactForm.reset();

            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            // Log data (for development - remove in production)
            console.log('Form Data:', data);

            // Here you would normally send data to your server:
            // fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // })

        }, 1500);
    }

    // ===== SHOW SUCCESS MESSAGE =====
    function showSuccessMessage() {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
            <div class="success-overlay"></div>
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Mensagem Enviada!</h3>
                <p>Obrigado pelo contato. Retornaremos em breve.</p>
                <button class="success-btn">Fechar</button>
            </div>
        `;

        document.body.appendChild(successModal);
        setTimeout(() => successModal.classList.add('active'), 10);

        // Close button
        successModal.querySelector('.success-btn').addEventListener('click', () => {
            successModal.classList.remove('active');
            setTimeout(() => successModal.remove(), 300);
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(successModal)) {
                successModal.classList.remove('active');
                setTimeout(() => successModal.remove(), 300);
            }
        }, 5000);
    }

    // ===== PHONE MASK =====
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 6) {
                    value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                } else if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }

            e.target.value = value;
        });
    }

    // ===== WHATSAPP BUTTON =====
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            // Replace with your actual WhatsApp number
            const phoneNumber = '5519981600429'; // Format: country code + area code + number
            const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos NYW MALHAS.');
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        });
    }

    // ===== REAL-TIME VALIDATION =====
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    function validateField(field) {
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');

        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error');

        const value = field.value.trim();
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            errorMessage = 'Campo obrigatório';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Email inválido';
            }
        } else if (field.id === 'name' && value && value.length < 3) {
            errorMessage = 'Nome muito curto';
        }

        if (errorMessage) {
            showError(field.id, errorMessage);
        }
    }

    // ===== BUSINESS HOURS CHECK =====
    function checkBusinessHours() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            // Business hours: Monday-Friday, 8:00-18:00
            if (day >= 1 && day <= 5 && hour >= 8 && hour < 18) {
                statusBadge.classList.add('open');
                statusBadge.classList.remove('closed');
                statusBadge.innerHTML = '<i class="fas fa-circle"></i> Aberto agora';
            } else {
                statusBadge.classList.remove('open');
                statusBadge.classList.add('closed');
                statusBadge.innerHTML = '<i class="fas fa-circle"></i> Fechado';
            }
        }
    }

    checkBusinessHours();
    // Update every minute
    setInterval(checkBusinessHours, 60000);

    // ===== SMOOTH SCROLL FOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ADD DYNAMIC STYLES =====
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            display: block;
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 0.3rem;
            animation: shake 0.3s ease;
        }
        
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: #e74c3c !important;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .success-modal {
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
        
        .success-modal.active {
            opacity: 1;
        }
        
        .success-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
        }
        
        .success-content {
            position: relative;
            background: var(--bg-light);
            padding: 3rem 2rem;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .success-modal.active .success-content {
            transform: scale(1);
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: #2ecc71;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .success-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .success-content h3 {
            color: var(--primary);
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        
        .success-content p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }
        
        .success-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .success-btn:hover {
            background: var(--primary-light);
            transform: translateY(-2px);
        }
        
        .status-badge.closed {
            background: #e74c3c;
        }
        
        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
});