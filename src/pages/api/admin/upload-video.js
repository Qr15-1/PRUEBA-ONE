import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

        // Obtener el archivo del formulario
        const formData = await request.formData();
        const file = formData.get('video');
        
        if (!file || file.size === 0) {
            return new Response(JSON.stringify({ error: 'No se proporcionó archivo de video' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar que sea un archivo de video
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ error: 'Tipo de archivo no válido. Solo se permiten videos (MP4, WebM, OGG, AVI, MOV)' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar tamaño del archivo (máximo 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return new Response(JSON.stringify({ error: 'El archivo es demasiado grande. Máximo 100MB' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear nombre único para el archivo
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const fileName = `video_${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Asegurar que la carpeta existe
        const videosDir = join(process.cwd(), 'public', 'videos');
        try {
            await mkdir(videosDir, { recursive: true });
        } catch (error) {
            // La carpeta ya existe, continuar
        }

        // Guardar el archivo
        const filePath = join(videosDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));

        // Retornar la URL del archivo
        const videoUrl = `/videos/${fileName}`;
        
        console.log(`✅ Video subido: ${fileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        return new Response(JSON.stringify({ 
            success: true,
            videoUrl: videoUrl,
            fileName: fileName,
            fileSize: file.size,
            message: 'Video subido correctamente'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error al subir video:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}