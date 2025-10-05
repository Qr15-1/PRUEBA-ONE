import { courseQueries } from '../../../../lib/database.js';

export async function GET({ request, params }) {
    try {
        // Verificar autenticación de admin
        const authHeader = request.headers.get('cookie');
        if (!authHeader || !authHeader.includes('admin_session')) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const courseId = params.id;
        const course = courseQueries.findById(courseId);

        if (!course) {
            return new Response(JSON.stringify({ error: 'Curso no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(course), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al obtener curso:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT({ request, params }) {
    try {
        // Verificar autenticación de admin
        const authHeader = request.headers.get('cookie');
        if (!authHeader || !authHeader.includes('admin_session')) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const courseId = params.id;
        const courseData = await request.json();

        // Validar campos requeridos
        const requiredFields = ['title', 'category', 'description', 'image', 'price', 'originalPrice', 'duration', 'level', 'students'];
        for (const field of requiredFields) {
            if (!courseData[field]) {
                return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Verificar que el curso existe
        const existingCourse = courseQueries.findById(courseId);
        if (!existingCourse) {
            return new Response(JSON.stringify({ error: 'Curso no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Actualizar curso
        const updatedCourse = courseQueries.update(courseId, courseData);

        if (!updatedCourse) {
            return new Response(JSON.stringify({ error: 'Error al actualizar curso' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(updatedCourse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}