// Script para manejar el responsive del carrusel
document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.querySelector('.slider__cards-container');
    const carousel = document.querySelector('.slider__carousel');
    
    if (!cardsContainer || !carousel) return;
    
           function updateCarouselForScreenSize() {
               const screenWidth = window.innerWidth;

               if (screenWidth <= 360) {
                   // Mobile Small: Mostrar 1.5 tarjetas
                   const cardWidth = 70;
                   const cardMargin = 3;
                   carousel.style.width = `${cardWidth * 1.5 + cardMargin}px`;
               } else if (screenWidth <= 480) {
                   // Mobile Large: Mostrar 2 tarjetas
                   const cardWidth = 100;
                   const cardMargin = 6;
                   carousel.style.width = `${cardWidth * 2 + cardMargin}px`;
               } else if (screenWidth <= 600) {
                   // Mobile Medium: Mostrar 2 tarjetas
                   const cardWidth = 130;
                   const cardMargin = 8;
                   carousel.style.width = `${cardWidth * 2 + cardMargin}px`;
               } else if (screenWidth <= 768) {
                   // Tablet Portrait: Mostrar 2 tarjetas
                   const cardWidth = 160;
                   const cardMargin = 12;
                   carousel.style.width = `${cardWidth * 2 + cardMargin}px`;
               } else if (screenWidth <= 1024) {
                   // Tablet Landscape: Mostrar 2 tarjetas
                   const cardWidth = 180;
                   const cardMargin = 10;
                   carousel.style.width = `${cardWidth * 2 + cardMargin}px`;
               } else {
                   // Desktop: Mostrar 3 tarjetas
                   const cardWidth = 250;
                   const cardMargin = 12;
                   carousel.style.width = `${cardWidth * 3 + cardMargin}px`;
               }
           }
    
    // Actualizar al cargar
    updateCarouselForScreenSize();
    
    // Actualizar al redimensionar
    window.addEventListener('resize', updateCarouselForScreenSize);
    
    // Actualizar el offset del carrusel según el tamaño de pantalla
           function updateCarouselOffset() {
               const screenWidth = window.innerWidth;
               const activeIndex = parseInt(document.querySelector('.slider__current-index').textContent) - 1;

               let cardWidth, cardMargin;

               if (screenWidth <= 360) {
                   cardWidth = 70;
                   cardMargin = 3;
               } else if (screenWidth <= 480) {
                   cardWidth = 100;
                   cardMargin = 6;
               } else if (screenWidth <= 600) {
                   cardWidth = 130;
                   cardMargin = 8;
               } else if (screenWidth <= 768) {
                   cardWidth = 160;
                   cardMargin = 12;
               } else if (screenWidth <= 1024) {
                   cardWidth = 180;
                   cardMargin = 10;
               } else {
                   cardWidth = 250;
                   cardMargin = 12;
               }

               const offset = (cardWidth + cardMargin) * activeIndex;
               cardsContainer.style.transform = `translateX(-${offset}px)`;
           }
    
    // Actualizar offset al cambiar de slide
    const originalUpdateSlider = window.updateSlider;
    if (originalUpdateSlider) {
        window.updateSlider = function(newIndex) {
            originalUpdateSlider(newIndex);
            setTimeout(updateCarouselOffset, 100);
        };
    }
});
