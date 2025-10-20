import { courseQueries, moduleQueries } from '../lib/database.js';

console.log('🔍 Verificando cursos en la base de datos...');

try {
    const courses = courseQueries.getAll();
    console.log(`📊 Total de cursos: ${courses.length}`);
    
    courses.forEach(course => {
        console.log(`\n📚 Curso: ${course.title}`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Categoría: ${course.category}`);
        console.log(`   Instructor: ${course.instructor}`);
        console.log(`   Precio: $${course.price}`);
        
        // Obtener módulos del curso
        const modules = moduleQueries.getByCourse(course.id);
        console.log(`   Módulos: ${modules.length}`);
        
        modules.forEach(module => {
            console.log(`     📖 ${module.title} (${module.duration}) - ${module.isFree ? 'Gratis' : 'Premium'}`);
            console.log(`        🎥 Video: ${module.videoUrl ? 'Disponible' : 'No disponible'}`);
        });
    });
    
    console.log('\n✅ Verificación completada');
} catch (error) {
    console.error('❌ Error al verificar cursos:', error);
}
