// ======================================= //
// === SISTEMA DE CARRITO SÚPER MODERNO === //
// ======================================= //

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('rojasfitt_cart')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateCartIcon();
        console.log('🛒 Sistema de carrito inicializado con', this.items.length, 'items');
    }

    bindEvents() {
        // Abrir carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon') || e.target.closest('.navbar__cart')) {
                e.preventDefault();
                this.openCart();
            }
        });

        // Cerrar carrito
        document.getElementById('cartClose')?.addEventListener('click', () => {
            this.closeCart();
        });

        // Cerrar al hacer clic en overlay
        document.getElementById('cart-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'cart-overlay') {
                this.closeCart();
            }
        });

        // Limpiar carrito
        document.getElementById('clearCart')?.addEventListener('click', () => {
            this.clearCart();
        });

        // Checkout
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.checkout();
        });

        // Agregar al carrito (iconos en tarjetas)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.card-cart-icon')) {
                e.preventDefault();
                const button = e.target.closest('.card-cart-icon');
                const courseData = this.getCourseDataFromButton(button);
                if (courseData) {
                    this.addToCart(courseData);
                }
            }
        });

        // Remover del carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-item-remove')) {
                const itemId = e.target.closest('.cart-item-remove').dataset.itemId;
                this.removeFromCart(itemId);
            }
        });

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    getCourseDataFromButton(button) {
        // Intentar obtener datos del botón
        const courseId = button.dataset.courseId;
        const courseTitle = button.dataset.courseTitle || 'Curso Premium';
        const coursePrice = parseFloat(button.dataset.coursePrice) || 99.99;
        const courseImage = button.dataset.courseImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400';
        const courseCategory = button.dataset.courseCategory || 'Fitness';

        if (!courseId) {
            console.warn('⚠️ No se encontró courseId en el botón');
            return null;
        }

        return {
            id: courseId,
            title: courseTitle,
            price: coursePrice,
            image: courseImage,
            category: courseCategory,
            slug: courseId
        };
    }

    addToCart(courseData) {
        // Verificar si el usuario está autenticado
        if (!this.isUserAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        // Verificar si ya existe
        const existingItem = this.items.find(item => item.id === courseData.id);
        
        if (existingItem) {
            this.showNotification('¡Este curso ya está en tu carrito!', 'warning');
            return;
        }

        // Agregar al carrito
        this.items.push({
            ...courseData,
            addedAt: new Date().toISOString()
        });

        this.saveCart();
        this.updateCartDisplay();
        this.updateCartIcon();
        this.showNotification('¡Curso agregado al carrito!', 'success');
        this.animateCartIcon();
        
        // Forzar actualización del contador
        setTimeout(() => {
            this.updateCartIcon();
        }, 100);
        
        console.log('✅ Curso agregado:', courseData.title);
    }

    removeFromCart(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartIcon();
        this.showNotification('Curso removido del carrito', 'info');
        
        // Forzar actualización del contador
        setTimeout(() => {
            this.updateCartIcon();
        }, 100);
        
        console.log('❌ Curso removido:', itemId);
    }

    clearCart() {
        if (this.items.length === 0) return;
        
        if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
            this.items = [];
            this.saveCart();
            this.updateCartDisplay();
            this.updateCartIcon();
            this.showNotification('Carrito limpiado', 'info');
            
            // Forzar actualización del contador
            setTimeout(() => {
                this.updateCartIcon();
            }, 100);
            
            console.log('🗑️ Carrito limpiado');
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Tu carrito está vacío', 'warning');
            return;
        }

        // Simular proceso de checkout
        this.showNotification('¡Redirigiendo al checkout...', 'success');
        
        // Aquí podrías integrar con Stripe, PayPal, etc.
        setTimeout(() => {
            alert(`¡Checkout simulado!\n\nTotal: $${this.getTotal().toFixed(2)}\nCursos: ${this.items.length}\n\nEn una implementación real, aquí se procesaría el pago.`);
        }, 1000);
        
        console.log('💳 Checkout iniciado:', this.items);
    }

    openCart() {
        // Verificar autenticación antes de abrir el carrito
        if (!this.isUserAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.updateCartDisplay();
            
            console.log('🛒 Carrito abierto');
        }
    }

    closeCart() {
        const overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            
            console.log('❌ Carrito cerrado');
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');
        const cartItemCount = document.getElementById('cartItemCount');

        if (!cartItems || !cartEmpty || !cartFooter) return;

        // Mostrar/ocultar elementos según el estado
        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'block';
            cartFooter.style.display = 'none';
        } else {
            cartItems.style.display = 'flex';
            cartEmpty.style.display = 'none';
            cartFooter.style.display = 'block';
            
            // Renderizar items
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <span class="cart-item-category">${item.category}</span>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove" data-item-id="${item.id}" title="Remover del carrito">
                        ✕
                    </button>
                </div>
            `).join('');
        }

        // Actualizar totales
        if (cartTotal) cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        if (cartItemCount) cartItemCount.textContent = this.items.length;
    }

    updateCartIcon() {
        const cartIcon = document.querySelector('.navbar__cart-count');
        if (cartIcon) {
            cartIcon.textContent = this.items.length;
            cartIcon.style.display = this.items.length > 0 ? 'block' : 'none';
            console.log('🛒 Contador actualizado:', this.items.length);
        } else {
            console.warn('⚠️ No se encontró el contador del carrito');
        }
    }

    animateCartIcon() {
        const cartIcon = document.querySelector('.navbar__cart');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            cartIcon.style.color = '#99FF00';
            
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
                cartIcon.style.color = '';
            }, 300);
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }

    saveCart() {
        localStorage.setItem('rojasfitt_cart', JSON.stringify(this.items));
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #99FF00, #7ACC00)' : 
                        type === 'warning' ? 'linear-gradient(135deg, #ff9500, #ff6b00)' :
                        type === 'error' ? 'linear-gradient(135deg, #ff4444, #cc0000)' :
                        'linear-gradient(135deg, #666, #444)'};
            color: ${type === 'success' ? '#0a0a0a' : '#fff'};
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Método público para agregar cursos desde cualquier parte
    addCourse(courseData) {
        this.addToCart(courseData);
    }

    // Método público para obtener el estado del carrito
    getCartState() {
        return {
            items: this.items,
            total: this.getTotal(),
            count: this.items.length
        };
    }

    // Verificar si el usuario está autenticado
    isUserAuthenticated() {
        // Verificar si hay una cookie de sesión de admin
        const adminSession = document.cookie.includes('admin_session=');
        
        // Verificar si hay una cookie de sesión de usuario
        const userSession = document.cookie.includes('user_session=');
        
        // Verificar si hay datos de usuario en localStorage
        const userData = localStorage.getItem('user_data');
        
        console.log('🔐 Verificando autenticación:', {
            adminSession,
            userSession,
            userData: !!userData
        });
        
        return adminSession || userSession || !!userData;
    }

    // Mostrar mensaje de iniciar sesión
    redirectToLogin() {
        // Mostrar notificación
        this.showNotification('🔐 Inicia sesión para acceder al carrito', 'warning');
    }
}

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    console.log('🚀 Sistema de carrito cargado y listo');
});

// Función global para agregar cursos al carrito
window.addToCart = function(courseData) {
    if (window.cart) {
        window.cart.addCourse(courseData);
    }
};

// Función global para abrir el carrito
window.openCart = function() {
    if (window.cart) {
        window.cart.openCart();
    }
};
