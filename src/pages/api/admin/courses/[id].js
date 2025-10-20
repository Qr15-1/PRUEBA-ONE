import { courseQueries } from '../../../../lib/database.js';

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

export async function PUT({ request, params, cookies }) {
    try {
        console.log('🔄 Iniciando actualización de curso...');
        
        // Verificar autenticación de admin
        const adminSession = cookies.get('admin_session')?.value;
        if (!adminSession) {
            console.log('❌ No hay sesión de admin');
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const courseId = params.id;
        console.log('📝 ID del curso:', courseId);
        
        const courseData = await request.json();
        console.log('📊 Datos del curso recibidos:', courseData);

        // Validar campos requeridos
        const requiredFields = ['title', 'category', 'description', 'image', 'price', 'duration', 'level', 'students'];
        for (const field of requiredFields) {
            if (!courseData[field]) {
                console.log(`❌ Campo requerido faltante: ${field}`);
                return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Validar campos numéricos
        if (isNaN(parseFloat(courseData.price))) {
            console.log('❌ Precio inválido');
            return new Response(JSON.stringify({ error: 'Precio debe ser un número válido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (courseData.originalPrice && isNaN(parseFloat(courseData.originalPrice))) {
            console.log('❌ Precio original inválido');
            return new Response(JSON.stringify({ error: 'Precio original debe ser un número válido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar que el curso existe
        const existingCourse = courseQueries.findById(courseId);
        if (!existingCourse) {
            console.log('❌ Curso no encontrado');
            return new Response(JSON.stringify({ error: 'Curso no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Curso encontrado, procediendo con actualización...');

        // Preparar datos para la actualización
        const updateData = {
            title: courseData.title,
            slug: courseData.slug || courseData.title.toLowerCase().replace(/\s+/g, '-'),
            description: courseData.description,
            image: courseData.image,
            price: parseFloat(courseData.price),
            originalPrice: courseData.originalPrice ? parseFloat(courseData.originalPrice) : null,
            category: courseData.category,
            duration: parseInt(courseData.duration),
            level: courseData.level,
            students: parseInt(courseData.students) || 0,
            instructor: courseData.instructor || 'Instructor'
        };
        
        console.log('📊 Datos preparados para actualización:', updateData);

        // Actualizar curso
        let updatedCourse;
        try {
            updatedCourse = courseQueries.update(courseId, updateData);
            console.log('📝 Resultado de actualización:', updatedCourse);
        } catch (dbError) {
            console.error('❌ Error en base de datos:', dbError);
            return new Response(JSON.stringify({ error: 'Error en base de datos: ' + dbError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!updatedCourse) {
            console.log('❌ Error al actualizar curso');
            return new Response(JSON.stringify({ error: 'Error al actualizar curso' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Curso actualizado exitosamente');
        return new Response(JSON.stringify(updatedCourse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('❌ Error al actualizar curso:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}