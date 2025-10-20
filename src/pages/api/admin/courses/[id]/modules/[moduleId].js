import { moduleQueries } from '../../../../../../lib/database.js';

export async function GET({ request, params, cookies }) {
    try {
        // Verificar autenticación de admin
        const adminSession = cookies.get('admin_session')?.value;
        if (!adminSession) {
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

export async function PUT({ request, params, cookies }) {
    try {
        console.log('🔄 Iniciando actualización de módulo...');
        console.log('📝 Parámetros recibidos:', params);
        console.log('🍪 Cookies recibidas:', cookies.getAll());
        
        // Verificar autenticación de admin
        const adminSession = cookies.get('admin_session')?.value;
        console.log('🔐 Sesión de admin:', adminSession ? 'Presente' : 'Ausente');
        if (!adminSession) {
            console.log('❌ No hay sesión de admin');
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const moduleId = params.moduleId;
        console.log('📝 ID del módulo:', moduleId);
        console.log('📝 Tipo de moduleId:', typeof moduleId);
        
        console.log('📥 Intentando parsear JSON del request...');
        const moduleData = await request.json();
        console.log('📊 Datos del módulo recibidos:', moduleData);
        console.log('📊 Tipo de datos:', typeof moduleData);
        
        // Validar datos requeridos
        const requiredFields = ['title', 'description', 'duration'];
        for (const field of requiredFields) {
            if (!moduleData[field]) {
                console.log(`❌ Campo requerido faltante: ${field}`);
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

        // Preparar datos para actualización
        const updateData = {
            title: moduleData.title,
            description: moduleData.description,
            videoUrl: moduleData.videoUrl,
            duration: moduleData.duration,
            orderIndex: moduleData.orderIndex || 0,
            isFree: moduleData.isFree
        };

        console.log('📊 Datos preparados para actualización:', updateData);
        console.log('📊 Tipo de updateData:', typeof updateData);
        console.log('📊 Keys de updateData:', Object.keys(updateData));

        // Actualizar módulo
        console.log('🔄 Llamando a moduleQueries.update...');
        console.log('🔄 moduleId:', moduleId, 'tipo:', typeof moduleId);
        console.log('🔄 updateData:', updateData);
        
        const result = moduleQueries.update(moduleId, updateData);
        console.log('📝 Resultado de actualización:', result);
        console.log('📝 Tipo de resultado:', typeof result);

        if (result.changes === 0) {
            console.log('❌ Módulo no encontrado');
            return new Response(JSON.stringify({ error: 'Módulo no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Módulo actualizado exitosamente');
        return new Response(JSON.stringify({ 
            message: 'Módulo actualizado correctamente' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('❌ Error al actualizar módulo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE({ request, params, cookies }) {
    try {
        // Verificar autenticación de admin
        const adminSession = cookies.get('admin_session')?.value;
        if (!adminSession) {
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
