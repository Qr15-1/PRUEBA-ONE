import { moduleQueries } from '../../../../../../lib/database.js';

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

        const moduleId = params.moduleId;
        
        // Obtener módulo por ID
        const module = moduleQueries.findById(moduleId);

        if (!module) {
            return new Response(JSON.stringify({ error: 'Módulo no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(module), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al obtener módulo:', error);
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

        const moduleId = params.moduleId;
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

        // Actualizar módulo
        const result = moduleQueries.update(moduleId, moduleData);

        if (result.changes === 0) {
            return new Response(JSON.stringify({ error: 'Módulo no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Módulo actualizado correctamente' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al actualizar módulo:', error);
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

        const moduleId = params.moduleId;

        // Eliminar módulo (soft delete)
        const result = moduleQueries.delete(moduleId);

        if (result.changes === 0) {
            return new Response(JSON.stringify({ error: 'Módulo no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            message: 'Módulo eliminado correctamente' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al eliminar módulo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
