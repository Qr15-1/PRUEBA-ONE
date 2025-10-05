import { courseQueries } from '../../../lib/database.js';

export async function GET({ request }) {
    try {
        // Verificar autenticación de admin
        const authHeader = request.headers.get('cookie');
        if (!authHeader || !authHeader.includes('admin_session')) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Obtener todos los cursos
        const courses = courseQueries.getAll();

        return new Response(JSON.stringify(courses), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request }) {
    try {
        // Verificar autenticación de admin
        const authHeader = request.headers.get('cookie');
        if (!authHeader || !authHeader.includes('admin_session')) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const courseData = await request.json();
        
        // Validar datos requeridos
        const requiredFields = ['title', 'category', 'description', 'instructor', 'level', 'duration', 'price', 'originalPrice', 'image', 'videoUrl'];
        for (const field of requiredFields) {
            if (!courseData[field]) {
                return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Crear slug único
        const slug = courseData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Agregar slug a los datos del curso
        courseData.slug = slug;

        // Insertar nuevo curso
        const result = courseQueries.create(courseData);

        return new Response(JSON.stringify({ 
            id: result.lastInsertRowid,
            message: 'Curso creado correctamente' 
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al crear curso:', error);
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
        
        // Validar datos requeridos
        const requiredFields = ['title', 'category', 'description', 'instructor', 'level', 'duration', 'price', 'originalPrice', 'image', 'videoUrl'];
        for (const field of requiredFields) {
            if (!courseData[field]) {
                return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Crear slug único
        const slug = courseData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Agregar slug a los datos del curso
        courseData.slug = slug;

        // Actualizar curso
        const result = courseQueries.update(courseId, courseData);

        if (result.changes === 0) {
            return new Response(JSON.stringify({ error: 'Curso no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Curso actualizado correctamente' 
        }), {
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

export async function DELETE({ request, params }) {
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

        // Eliminar curso (soft delete)
        const result = courseQueries.delete(courseId);

        if (result.changes === 0) {
            return new Response(JSON.stringify({ error: 'Curso no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Curso eliminado correctamente' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
