
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. SELECCIÓN DE TODOS LOS ELEMENTOS DEL DO
    // =================================================================
    const backgrounds = document.querySelectorAll('.slider__background-item');
    const texts = document.querySelectorAll('.slider__text-item');
    const cards = document.querySelectorAll('.slider__card');
    const cardsContainer = document.querySelector('.slider__cards-container');

    const progressBarFill = document.querySelector('.slider__progress-bar-fill');
    const currentIndexElement = document.querySelector('.slider__current-index');
    const autoResetIndicator = document.getElementById('autoResetIndicator');

    // =================================================================
    // 2. GESTIÓN DEL ESTADO
    // Aquí definimos las variables que controlarán el estado actual del slider.
    // =================================================================
    let activeIndex = 0; // El índice del slide que está activo en este momento.
    const totalSlides = backgrounds.length; // El número total de slides que tenemos.
    let autoResetTimeout = null; // Para cancelar el rebote automático si es necesario.

    // =================================================================
    // 3. LA FUNCIÓN PRINCIPAL: updateSlider
    // Esta es la función central que se encarga de actualizar TODA la interfaz
    // para que coincida con el nuevo índice activo.
    // =================================================================
    function updateSlider(newIndex) {
        
        // --- a) Cancelar cualquier rebote automático pendiente ---
        if (autoResetTimeout) {
            clearTimeout(autoResetTimeout);
            autoResetTimeout = null;
        }
        
        // Ocultar el indicador de rebote automático
        if (autoResetIndicator) {
            autoResetIndicator.classList.remove('show');
        }
        
        // --- b) Limpiar el estado anterior ---
        // Quitamos la clase 'active' del fondo y texto que estaban activos antes.
        backgrounds[activeIndex].classList.remove('active');
        texts[activeIndex].classList.remove('active');
        
        // --- c) Establecer el nuevo estado ---
        // Actualizamos la variable global 'activeIndex' con el nuevo índice.
        activeIndex = newIndex;

        // --- c) Actualizar el Fondo y el Texto ---
        // Añadimos la clase 'active' al nuevo fondo y texto para que se muestren.
        // El CSS se encargará de la animación de transición suave.
        backgrounds[activeIndex].classList.add('active');
        texts[activeIndex].classList.add('active');

        // --- d) Actualizar la posición del Carrusel ---
        // Calculamos cuánto se debe desplazar el "tren" de tarjetas.
        const cardWidth = cards[0].offsetWidth; // Ancho de una tarjeta.
        const cardMargin = parseInt(window.getComputedStyle(cards[0]).marginRight); // Margen derecho.
        const offset = (cardWidth + cardMargin) * activeIndex; // Desplazamiento total para tarjetas separadas.
        
        // Aplicamos la transformación CSS para mover el contenedor.
        cardsContainer.style.transform = `translateX(-${offset}px)`;

        // --- e) Actualizar la Barra de Progreso y el Contador ---
        const progressPercentage = ((activeIndex + 1) / totalSlides) * 100;
        progressBarFill.style.width = `${progressPercentage}%`;

        // El .padStart(2, '0') asegura que el número siempre tenga dos dígitos (ej: 01, 02).
        currentIndexElement.textContent = (activeIndex + 1).toString().padStart(2, '0');
    }

    // =================================================================
    // 3.1 FUNCIÓN PARA EL EFECTO DE REBOTE AL FINAL
    // Cuando llegamos al último slide, hacemos un efecto especial de "reset"
    // =================================================================
    function resetToBeginning() {
        // Añadimos la clase de efecto de rebote
        cardsContainer.classList.add('reset-effect');
        
        // Movemos el carrusel de vuelta al inicio (posición 0)
        cardsContainer.style.transform = 'translateX(0px)';
        
        // Después de la animación, removemos la clase especial
        setTimeout(() => {
            cardsContainer.classList.remove('reset-effect');
        }, 400);
    }

    // =================================================================
    // 4. EVENT LISTENERS PARA LAS TARJETAS Y FLECHITAS
    // Aquí es donde escuchamos los clics en las tarjetas y las flechitas
    // =================================================================

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            // Cuando se hace clic en una tarjeta, vamos al slide correspondiente
            // Tarjeta 0 va al slide 0, Tarjeta 1 va al slide 1, etc.
            const targetIndex = index;
            
            // Comportamiento normal - siempre va al slide correspondiente
            updateSlider(targetIndex);
            
            // SOLO programamos el rebote automático si llegamos al ÚLTIMO slide
            if (targetIndex === totalSlides - 1) {
                // Mostrar el indicador de rebote automático
                if (autoResetIndicator) {
                    autoResetIndicator.classList.add('show');
                }
                
                // Después de un delay, hacemos el rebote automático
                autoResetTimeout = setTimeout(() => {
                    resetToBeginning();
                    updateSlider(0); // Volvemos al primer slide automáticamente
                }, 3000); // 3 segundos para que el usuario vea el último slide
            }
        });
    });

    // =================================================================
    // 4.1 EVENT LISTENERS PARA LAS FLECHITAS DE NAVEGACIÓN
    // =================================================================
    
    const prevButton = document.getElementById('prevSlide');
    const nextButton = document.getElementById('nextSlide');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const newIndex = activeIndex > 0 ? activeIndex - 1 : totalSlides - 1;
            updateSlider(newIndex);
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const newIndex = activeIndex < totalSlides - 1 ? activeIndex + 1 : 0;
            updateSlider(newIndex);
        });
    }
        
    // =================================================================
    // 5. INICIALIZACIÓN
    // Llamamos a la función una vez al cargar la página para asegurarnos
    // de que todo está en su estado inicial correcto (mostrando el slide 0).
    // =================================================================
    updateSlider(0);

    // =================================================================
    // 6. FUNCIONALIDAD DE CURSOS
    // Manejo de clics en botones de cursos y play buttons
    // =================================================================
    
    // Mapeo de cursos a sus slugs - ahora dinámico
    const courseSlugs = {};
    
    // Obtener todos los cursos de la página para crear el mapeo dinámico
    const courseButtons = document.querySelectorAll('[data-course]');
    courseButtons.forEach(button => {
        const courseId = button.getAttribute('data-course');
        if (courseId) {
            courseSlugs[courseId] = courseId; // El slug es el mismo que el ID
        }
    });

    // Función para redirigir a la página del curso
    function goToCourse(courseId) {
        const slug = courseSlugs[courseId];
        if (slug) {
            window.location.href = `/curso/${slug}`;
        } else {
            console.error('Curso no encontrado:', courseId);
        }
    }

    // Event listeners para botones "Ver Curso" y botones del hero slider
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('course-btn')) {
            e.preventDefault();
            const courseId = e.target.getAttribute('data-course');
            if (courseId) {
                goToCourse(courseId);
            }
        }
        
        // Manejar botones del hero slider que no tienen data-course pero sí href
        if (e.target.classList.contains('text-item__button') && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('/curso/')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            const courseSlug = href.split('/curso/')[1];
            if (courseSlug) {
                window.location.href = href;
            }
        }
    });

    // Event listeners para botones de play
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('play-button') || e.target.closest('.play-button')) {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.classList.contains('play-button') ? e.target : e.target.closest('.play-button');
            const courseId = button.getAttribute('data-course');
            if (courseId) {
                goToCourse(courseId);
            }
        }
    });

});