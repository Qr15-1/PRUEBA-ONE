// Script para navegación entre módulos
console.log('=== MÓDULO DE NAVEGACIÓN CARGADO ===');

// Función global para cambiar módulos
window.changeModule = function(direction) {
  console.log('=== CAMBIO DE MÓDULO INICIADO ===');
  console.log('Dirección:', direction);
  
  // Obtener el índice actual de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentModule = parseInt(urlParams.get('module')) || 0;
  
  console.log('Módulo actual:', currentModule);
  
  // Calcular nuevo índice
  const newModule = currentModule + direction;
  console.log('Nuevo módulo:', newModule);
  
  // Verificar límites (asumimos máximo 10 módulos por ahora)
  if (newModule < 0 || newModule > 9) {
    console.log('❌ Fuera de límites');
    return;
  }
  
  // Crear nueva URL
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('module', newModule);
  
  console.log('🔄 Redirigiendo a:', newUrl.toString());
  window.location.href = newUrl.toString();
};

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== CONFIGURANDO NAVEGACIÓN ===');
  
  const prevBtn = document.getElementById('prevModuleBtn');
  const nextBtn = document.getElementById('nextModuleBtn');
  
  console.log('Botón anterior:', prevBtn);
  console.log('Botón siguiente:', nextBtn);
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🖱️ Botón anterior clickeado');
      window.changeModule(-1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🖱️ Botón siguiente clickeado');
      window.changeModule(1);
    });
  }
  
  console.log('=== NAVEGACIÓN CONFIGURADA ===');
});
