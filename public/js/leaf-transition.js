// =================================================================
// NAVEGACIÓN SUAVE ENTRE SECCIONES
// =================================================================

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.navbar__link');
    
    // Función para scroll suave entre secciones
    function smoothScrollToSection(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Event listeners para los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Si es un enlace interno (empieza con #)
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollToSection(href);
            }
            // Para enlaces externos, dejar que navegue normalmente
        });
    });
    
    // Scroll suave para botones del hero slider
    const heroButtons = document.querySelectorAll('.text-item__button');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollToSection(href);
            }
            // Para enlaces externos, dejar que navegue normalmente
        });
    });
    
    console.log('✨ Navegación suave inicializada');
});
