import { courseQueries } from '../../lib/database.js';

export async function GET() {
    try {
        const courses = await courseQueries.getAll();
        
        // Filtrar solo cursos activos para la web pública
        const activeCourses = courses.filter(course => course.status === 'active');
        
        return new Response(JSON.stringify({
            success: true,
            courses: activeCourses
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al cargar los cursos'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
