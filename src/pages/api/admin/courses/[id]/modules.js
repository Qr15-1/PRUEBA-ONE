import { moduleQueries } from '../../../../../lib/database.js';

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
        const modules = moduleQueries.getByCourse(courseId);

        return new Response(JSON.stringify(modules), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al obtener módulos:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request, params }) {
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
        const moduleData = await request.json();
        
        // Validar datos requeridos
        const requiredFields = ['title', 'description', 'duration'];
        for (const field of requiredFields) {
            if (!moduleData[field]) {
                return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Si no hay videoUrl, usar placeholder
        if (!moduleData.videoUrl) {
            moduleData.videoUrl = 'sin_video';
        }

        // Agregar courseId a los datos del módulo
        moduleData.courseId = courseId;

        // Insertar nuevo módulo
        const result = moduleQueries.create(moduleData);

        return new Response(JSON.stringify({ 
            id: result.lastInsertRowid,
            message: 'Módulo creado correctamente' 
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al crear módulo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
