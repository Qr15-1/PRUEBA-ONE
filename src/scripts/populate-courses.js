import { courseQueries, moduleQueries } from '../lib/database.js';

// Cursos de ejemplo
const sampleCourses = [
    {
        title: 'CrossFit Intensivo',
        category: 'Entrenamiento Funcional',
        description: 'Desarrolla fuerza, resistencia y agilidad con nuestro programa de CrossFit completo. Aprende los movimientos fundamentales y técnicas avanzadas.',
        instructor: 'Carlos Rojas',
        level: 'Intermedio',
        duration: 2.0,
        students: 1234,
        price: 49.99,
        originalPrice: 99.99,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        slug: 'crossfit-intensivo',
        modules: [
            {
                title: 'Introducción al CrossFit',
                description: 'Fundamentos del CrossFit y preparación mental',
                duration: '12:30',
                isFree: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'Movimientos Básicos',
                description: 'Aprende los movimientos fundamentales del CrossFit',
                duration: '25:15',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'Técnicas Avanzadas',
                description: 'Domina las técnicas más complejas del CrossFit',
                duration: '30:20',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
        ]
    },
    {
        title: 'Yoga Power',
        category: 'Yoga & Mindfulness',
        description: 'Combina fuerza física con equilibrio mental. Clases de yoga dinámico que fortalecen tu cuerpo y calman tu mente.',
        instructor: 'Ana García',
        level: 'Principiante',
        duration: 1.5,
        students: 856,
        price: 29.99,
        originalPrice: 59.99,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        slug: 'yoga-power',
        modules: [
            {
                title: 'Fundamentos del Yoga',
                description: 'Introducción a la práctica del yoga',
                duration: '15:20',
                isFree: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'Posturas Básicas',
                description: 'Aprende las posturas fundamentales del yoga',
                duration: '20:15',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
        ]
    },
    {
        title: 'Cardio Extremo',
        category: 'Cardio & Resistencia',
        description: 'Quema calorías y mejora tu resistencia cardiovascular con sesiones intensas de cardio.',
        instructor: 'Miguel Torres',
        level: 'Avanzado',
        duration: 1.0,
        students: 2156,
        price: 39.99,
        originalPrice: 79.99,
        image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        slug: 'cardio-extremo',
        modules: [
            {
                title: 'Calentamiento Dinámico',
                description: 'Prepara tu cuerpo para el entrenamiento intenso',
                duration: '10:00',
                isFree: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'HIIT Básico',
                description: 'Entrenamiento de intervalos de alta intensidad',
                duration: '25:30',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
        ]
    },
    {
        title: 'Nutrición Inteligente',
        category: 'Nutrición & Dietética',
        description: 'Aprende a alimentarte correctamente para maximizar tus resultados fitness con planes nutricionales personalizados.',
        instructor: 'Dr. Roberto Silva',
        level: 'Principiante',
        duration: 3.0,
        students: 3421,
        price: 59.99,
        originalPrice: 119.99,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        slug: 'nutricion-inteligente',
        modules: [
            {
                title: 'Fundamentos de la Nutrición',
                description: 'Principios básicos de la nutrición deportiva',
                duration: '18:30',
                isFree: true,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'Macronutrientes',
                description: 'Proteínas, carbohidratos y grasas para el fitness',
                duration: '25:15',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
                title: 'Planes Nutricionales',
                description: 'Cómo crear planes nutricionales personalizados',
                duration: '30:20',
                isFree: false,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            }
        ]
    }
];

async function populateDatabase() {
    try {
        console.log('🚀 Iniciando población de la base de datos...');

        for (const courseData of sampleCourses) {
            console.log(`📚 Creando curso: ${courseData.title}`);
            
            // Crear curso
            const courseResult = courseQueries.create(courseData);
            const courseId = courseResult.lastInsertRowid;
            
            console.log(`✅ Curso creado con ID: ${courseId}`);

            // Crear módulos del curso (ahora incluyen videos)
            for (let i = 0; i < courseData.modules.length; i++) {
                const moduleData = courseData.modules[i];
                moduleData.courseId = courseId;
                moduleData.orderIndex = i + 1;
                
                const moduleResult = moduleQueries.create(moduleData);
                const moduleId = moduleResult.lastInsertRowid;
                
                console.log(`  📖 Módulo creado: ${moduleData.title} (ID: ${moduleId}) - ${moduleData.isFree ? 'Gratis' : 'Premium'}`);
            }
        }

        console.log('✅ Base de datos poblada correctamente');
        console.log(`📊 Cursos creados: ${sampleCourses.length}`);
        
        // Mostrar estadísticas
        const courses = courseQueries.getAll();
        console.log(`📈 Total de cursos en la base de datos: ${courses.length}`);
        
    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    populateDatabase();
}

export { populateDatabase };
