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
        
        if (this.isUserAuthenticated()) {
            console.log('🛒 Sistema de carrito inicializado con', this.items.length, 'items');
            // Verificar estado de cursos al inicializar
            this.checkCourseStatus();
        } else {
            console.log('🔐 Usuario no autenticado - carrito oculto');
        }
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
        const courseSlug = button.dataset.courseSlug || courseId;
        const courseTitle = button.dataset.courseTitle || 'Curso Premium';
        const coursePrice = button.dataset.coursePrice ? parseFloat(button.dataset.coursePrice) : null;
        const courseImage = button.dataset.courseImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400';
        const courseCategory = button.dataset.courseCategory || 'Fitness';

        console.log('🛒 Datos del botón:', {
            courseId,
            courseSlug,
            courseTitle,
            coursePrice,
            courseCategory,
            buttonDataset: button.dataset
        });

        if (!courseId) {
            console.warn('⚠️ No se encontró courseId en el botón');
            return null;
        }

        if (!coursePrice || coursePrice === 0) {
            console.error('❌ No se encontró precio válido en el botón');
            this.showNotification('Error: No se pudo obtener el precio del curso', 'error');
            return null;
        }

        return {
            id: courseId,
            slug: courseSlug,
            title: courseTitle,
            price: coursePrice,
            image: courseImage,
            category: courseCategory
        };
    }

    addToCart(courseData) {
        // Verificar si el usuario está autenticado
        if (!this.isUserAuthenticated()) {
            this.showNotification('🔐 Debes iniciar sesión para agregar cursos al carrito', 'warning');
            this.redirectToLogin();
            return;
        }

        console.log('🛒 Agregando curso al carrito:', courseData);
        console.log('📋 Cursos actuales en el carrito:', this.items.map(item => ({ id: item.id, title: item.title, slug: item.slug })));

        // Verificar si el curso ya está pendiente o confirmado
        const courseId = parseInt(courseData.id);
        const pendingCourses = JSON.parse(localStorage.getItem('pending_courses') || '[]');
        const confirmedCourses = JSON.parse(localStorage.getItem('confirmed_courses') || '[]');
        
        const isPending = pendingCourses.some(course => parseInt(course.id) === courseId);
        const isConfirmed = confirmedCourses.some(course => parseInt(course.id) === courseId);
        
        if (isPending) {
            console.log('⏳ Curso ya está pendiente de confirmación:', courseData.title);
            this.showNotification('⏳ Este curso ya está pendiente de confirmación', 'warning');
            return;
        }
        
        if (isConfirmed) {
            console.log('✅ Curso ya está confirmado:', courseData.title);
            this.showNotification('✅ Ya tienes este curso disponible', 'info');
            return;
        }

        // Verificar si ya existe por ID, slug o título
        const existingItem = this.items.find(item => 
            item.id === courseData.id || 
            item.id == courseData.id || // Comparación flexible
            item.slug === courseData.slug ||
            (item.title === courseData.title && item.price === courseData.price)
        );
        
        if (existingItem) {
            console.log('⚠️ Curso ya existe en el carrito:', existingItem);
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
<<<<<<< HEAD
    }

    removeFromCart(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
=======
        console.log('📦 Total de cursos en carrito:', this.items.length);
    }

    removeFromCart(itemId) {
        console.log('🗑️ Intentando remover item:', itemId);
        console.log('📦 Items antes de remover:', this.items.length);
        console.log('📋 IDs disponibles:', this.items.map(item => item.id));
        
        // Intentar diferentes tipos de búsqueda
        const originalLength = this.items.length;
        let itemRemoved = false;
        
        // Primero intentar con ID exacto
        this.items = this.items.filter(item => {
            if (item.id == itemId || item.id === itemId) {
                console.log('✅ Item encontrado y removido:', item.id, item.title);
                itemRemoved = true;
                return false; // Remover el item
            }
            return true; // Mantener el item
        });
        
        // Si no se encontró, intentar con slug
        if (!itemRemoved) {
            this.items = this.items.filter(item => {
                if (item.slug == itemId || item.slug === itemId) {
                    console.log('✅ Item encontrado por slug y removido:', item.slug, item.title);
                    itemRemoved = true;
                    return false; // Remover el item
                }
                return true; // Mantener el item
            });
        }
        
        // Si aún no se encontró, remover por índice (último recurso)
        if (!itemRemoved && this.items.length > 0) {
            console.log('⚠️ ID no encontrado, removiendo el último item');
            this.items.pop();
            itemRemoved = true;
        }
        
        console.log('📦 Items después de filtrar:', this.items.length);
        
        if (!itemRemoved) {
            console.warn('⚠️ No se pudo remover ningún item');
            this.showNotification('Error al remover el curso', 'error');
            return;
        }
        
        // Guardar y actualizar
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartIcon();
        this.showNotification('Curso removido del carrito', 'info');
        
        console.log('✅ Curso removido exitosamente');
        console.log('📦 Items restantes:', this.items.length);
    }

    clearCart() {
        if (this.items.length === 0) {
            this.showNotification('El carrito ya está vacío', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
            console.log('🗑️ Limpiando carrito - Items antes:', this.items.length);
            
            this.items = [];
            this.saveCart();
            this.updateCartDisplay();
            this.updateCartIcon();
            this.showNotification('Carrito limpiado', 'info');
            
            console.log('✅ Carrito limpiado - Items después:', this.items.length);
        }
    }

    // Función para limpiar el carrito sin confirmación (para uso interno)
    forceClearCart() {
        console.log('🗑️ LIMPIEZA FORZADA DEL CARRITO...');
        
        // Limpiar completamente
        this.items = [];
        localStorage.removeItem('rojasfitt_cart');
        
        // Limpiar también otros posibles nombres de localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('shopping_cart');
        localStorage.removeItem('cart_items');
        
        // Actualizar interfaz inmediatamente
        this.updateCartDisplay();
        this.updateCartIcon();
        
        // Cerrar carrito si está abierto
        this.closeCart();
        
        console.log('✅ Carrito limpiado forzadamente - Items:', this.items.length);
        
        // Forzar actualización múltiple
        setTimeout(() => {
            this.updateCartDisplay();
            this.updateCartIcon();
        }, 100);
        
        setTimeout(() => {
            this.updateCartDisplay();
            this.updateCartIcon();
        }, 300);
        
        setTimeout(() => {
            this.updateCartDisplay();
            this.updateCartIcon();
        }, 500);
        
        // Verificar que realmente se limpió
        setTimeout(() => {
            const remainingItems = JSON.parse(localStorage.getItem('rojasfitt_cart') || '[]');
            console.log('🔍 Verificación final - Items restantes en localStorage:', remainingItems.length);
            console.log('🔍 Verificación final - Items en this.items:', this.items.length);
            
            if (remainingItems.length > 0 || this.items.length > 0) {
                console.error('❌ ERROR: El carrito no se limpió completamente');
                console.log('🔄 Intentando limpieza adicional...');
                this.items = [];
                localStorage.removeItem('rojasfitt_cart');
                this.updateCartDisplay();
                this.updateCartIcon();
            } else {
                console.log('✅ Carrito limpiado exitosamente');
            }
        }, 1000);
    }

>>>>>>> origin/master
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Tu carrito está vacío', 'warning');
            return;
        }

<<<<<<< HEAD
        // Simular proceso de checkout
        this.showNotification('¡Redirigiendo al checkout...', 'success');
        
        // Aquí podrías integrar con Stripe, PayPal, etc.
        setTimeout(() => {
            alert(`¡Checkout simulado!\n\nTotal: $${this.getTotal().toFixed(2)}\nCursos: ${this.items.length}\n\nEn una implementación real, aquí se procesaría el pago.`);
        }, 1000);
        
        console.log('💳 Checkout iniciado:', this.items);
=======
        // Cerrar el carrito antes de redirigir
        this.closeCart();
        
        // Redirigir a la página de checkout
        this.showNotification('¡Redirigiendo al checkout...', 'success');
        
        setTimeout(() => {
            window.location.href = '/checkout';
        }, 1000);
        
        console.log('💳 Redirigiendo al checkout:', this.items);
>>>>>>> origin/master
    }

    openCart() {
        // Verificar autenticación antes de abrir el carrito
        if (!this.isUserAuthenticated()) {
            this.showNotification('🔐 Debes iniciar sesión para ver el carrito', 'warning');
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

        console.log('🔄 Actualizando display del carrito - Items:', this.items.length);

        // Mostrar/ocultar elementos según el estado
        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'block';
            cartFooter.style.display = 'none';
            console.log('📭 Carrito vacío - mostrando mensaje');
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
            console.log('📦 Carrito con items - renderizando', this.items.length, 'items');
        }

        // Actualizar totales
        if (cartTotal) cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        if (cartItemCount) cartItemCount.textContent = this.items.length;
    }

    updateCartIcon() {
        const cartIcon = document.querySelector('.navbar__cart-count');
        if (cartIcon) {
            // Solo mostrar el contador si el usuario está autenticado
            if (this.isUserAuthenticated()) {
                cartIcon.textContent = this.items.length;
                cartIcon.style.display = this.items.length > 0 ? 'block' : 'none';
                console.log('🛒 Contador actualizado:', this.items.length);
            } else {
                // Si no está autenticado, ocultar el contador
                cartIcon.style.display = 'none';
                console.log('🔐 Usuario no autenticado - ocultando contador del carrito');
            }
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

<<<<<<< HEAD
=======
    // Verificar estado de cursos y actualizar botones
    async checkCourseStatus() {
        const userData = localStorage.getItem('user_data');
        if (!userData) return;
        
        try {
            const user = JSON.parse(userData);
            const response = await fetch(`/api/payments/check-status?email=${encodeURIComponent(user.email)}`);
            const result = await response.json();
            
            if (result.success) {
                // Obtener todos los IDs de cursos pendientes y confirmados
                const pendingCourseIds = new Set();
                const confirmedCourseIds = new Set();
                
                if (result.pending && result.pending.length > 0) {
                    result.pending.forEach(payment => {
                        const courseIds = JSON.parse(payment.course_ids);
                        courseIds.forEach(id => pendingCourseIds.add(parseInt(id)));
                    });
                }
                
                if (result.confirmed && result.confirmed.length > 0) {
                    result.confirmed.forEach(payment => {
                        const courseIds = JSON.parse(payment.course_ids);
                        courseIds.forEach(id => confirmedCourseIds.add(parseInt(id)));
                    });
                }
                
                // Actualizar botones de carrito en toda la página
                document.querySelectorAll('.card-cart-icon').forEach(button => {
                    const courseId = parseInt(button.getAttribute('data-course-id') || '0');
                    
                    if (confirmedCourseIds.has(courseId)) {
                        button.disabled = true;
                        button.textContent = '✅';
                        button.title = 'Ya tienes este curso';
                        button.style.background = '#22c55e';
                        button.style.cursor = 'not-allowed';
                    } else if (pendingCourseIds.has(courseId)) {
                        button.disabled = true;
                        button.textContent = '⏳';
                        button.title = 'Pago pendiente de confirmación';
                        button.style.background = '#ffa500';
                        button.style.cursor = 'not-allowed';
                    } else {
                        button.disabled = false;
                        button.textContent = '🛒';
                        button.title = 'Agregar al carrito';
                        button.style.background = 'linear-gradient(135deg, #99FF00, #7ACC00)';
                        button.style.cursor = 'pointer';
                    }
                });
            }
        } catch (error) {
            console.log('ℹ️ No se pudo verificar estado de cursos:', error);
        }
    }

>>>>>>> origin/master
    // Verificar si el usuario está autenticado
    isUserAuthenticated() {
        // Verificar si hay una cookie de sesión de admin
        const adminSession = document.cookie.includes('admin_session=');
        
        // Verificar si hay una cookie de sesión de usuario
        const userSession = document.cookie.includes('user_session=');
        
        // Verificar si hay datos de usuario en localStorage
        const userData = localStorage.getItem('user_data');
        
        return adminSession || userSession || !!userData;
    }

    // Mostrar mensaje de login sin redirigir
    redirectToLogin() {
        // Solo mostrar notificación, sin redirigir
        this.showNotification('🔐 Debes iniciar sesión para acceder a esta función', 'warning');
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

// Función global para limpiar el carrito
window.clearCart = function() {
    if (window.cart) {
        window.cart.forceClearCart();
    }
};

// Función global para verificar estado de cursos
window.checkCourseStatus = function() {
    if (window.cart) {
        window.cart.checkCourseStatus();
    }
};

// Función de debug para verificar el estado del carrito
window.debugCart = function() {
    if (window.cart) {
        console.log('🔍 Estado del carrito:');
        console.log('- Items en this.items:', window.cart.items.length);
        console.log('- Items en localStorage:', JSON.parse(localStorage.getItem('rojasfitt_cart') || '[]').length);
        console.log('- Items:', window.cart.items);
    }
};

// Función de emergencia para limpiar TODO
window.emergencyClearCart = function() {
    console.log('🚨 LIMPIEZA DE EMERGENCIA DEL CARRITO');
    
    // Limpiar localStorage completamente
    localStorage.clear();
    
    // Limpiar el carrito si existe
    if (window.cart) {
        window.cart.items = [];
        window.cart.updateCartDisplay();
        window.cart.updateCartIcon();
        window.cart.closeCart();
    }
    
    // Recargar la página
    setTimeout(() => {
        window.location.reload();
    }, 1000);
    
    console.log('✅ Limpieza de emergencia completada - Recargando página...');
};

// Función para remover el primer item del carrito (último recurso)
window.removeFirstItem = function() {
    if (window.cart && window.cart.items.length > 0) {
        console.log('🗑️ Removiendo el primer item del carrito...');
        window.cart.items.shift(); // Remover el primer elemento
        window.cart.saveCart();
        window.cart.updateCartDisplay();
        window.cart.updateCartIcon();
        console.log('✅ Primer item removido');
    } else {
        console.log('❌ No hay items en el carrito');
    }
};

// Función para eliminar duplicados del carrito
window.removeDuplicates = function() {
    if (window.cart) {
        console.log('🔄 Eliminando duplicados del carrito...');
        console.log('📋 Items antes:', window.cart.items.length);
        
        // Crear un Set para rastrear items únicos
        const uniqueItems = [];
        const seen = new Set();
        
        window.cart.items.forEach(item => {
            // Crear una clave única basada en ID, slug, título y precio
            const key = `${item.id || item.slug || item.title}-${item.price}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                uniqueItems.push(item);
            } else {
                console.log('🗑️ Duplicado encontrado y removido:', item.title);
            }
        });
        
        window.cart.items = uniqueItems;
        window.cart.saveCart();
        window.cart.updateCartDisplay();
        window.cart.updateCartIcon();
        
        console.log('✅ Duplicados eliminados');
        console.log('📋 Items después:', window.cart.items.length);
    }
};
