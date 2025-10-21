import { moduleQueries } from '../../../../../lib/database.js';

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

export async function POST({ request, params, cookies }) {
    try {
        console.log('🔄 Iniciando creación de módulo...');
        
        // Verificar autenticación de admin
        const adminSession = cookies.get('admin_session')?.value;
        if (!adminSession) {
            console.log('❌ No hay sesión de admin');
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const courseId = parseInt(params.id);
        console.log('📝 ID del curso:', courseId);
        console.log('📝 Tipo de courseId:', typeof courseId);
        
        if (isNaN(courseId)) {
            console.log('❌ CourseId no es un número válido');
            return new Response(JSON.stringify({ error: 'ID de curso inválido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const moduleData = await request.json();
        console.log('📊 Datos del módulo recibidos:', moduleData);
        
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

        // Agregar courseId a los datos del módulo
        moduleData.courseId = courseId;
        moduleData.orderIndex = moduleData.orderIndex || 0;
        moduleData.isFree = moduleData.isFree ? 1 : 0;

        console.log('📊 Datos preparados para creación:', moduleData);
        console.log('📊 courseId final:', moduleData.courseId);
        console.log('📊 Tipo de courseId final:', typeof moduleData.courseId);

        // Insertar nuevo módulo
        let result;
        try {
            console.log('🔄 Llamando a moduleQueries.create...');
            result = moduleQueries.create(moduleData);
            console.log('📝 Resultado de creación:', result);
            console.log('📝 Tipo de resultado:', typeof result);
            console.log('📝 lastInsertRowid:', result.lastInsertRowid);
        } catch (dbError) {
            console.error('❌ Error específico de base de datos:', dbError);
            throw dbError;
        }

        return new Response(JSON.stringify({ 
            id: result.lastInsertRowid,
            message: 'Módulo creado correctamente' 
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('❌ Error al crear módulo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
