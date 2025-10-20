// Script para manejar la navegación activa
document.addEventListener('DOMContentLoaded', () => {
    // Obtener la página actual basada en la URL
    const currentPath = window.location.pathname;
    console.log('🔍 Ruta actual:', currentPath);
    
    // Mapear las rutas a los data-page
    const pageMap = {
        '/': 'inicio',
        '/cursos': 'cursos',
        '/sobre-mi': 'sobre-mi'
    };
    
    // Detectar si estamos en una página de curso individual
    let currentPage = pageMap[currentPath];
    
    if (!currentPage) {
        // Si no encontramos la ruta exacta, verificar si es una página de curso
        if (currentPath.startsWith('/curso/')) {
            currentPage = 'cursos';
        } else {
            currentPage = 'inicio';
        }
    }
    
    // Remover la clase active de todos los enlaces
    const navLinks = document.querySelectorAll('.navbar__link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar la clase active al enlace correspondiente
    const activeLink = document.querySelector(`[data-page="${currentPage}"]`);
    console.log('🎯 Página detectada:', currentPage);
    console.log('🔗 Enlace activo encontrado:', activeLink);
    
    if (activeLink) {
        activeLink.classList.add('active');
        console.log('✅ Clase active agregada a:', activeLink.textContent);
    } else {
        console.log('❌ No se encontró enlace para la página:', currentPage);
    }
});
