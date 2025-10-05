import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testUpload() {
    try {
        console.log('🧪 Probando endpoint de subida de video...');
        
        // Crear un archivo de prueba
        const testFile = 'public/videos/test-upload.mp4';
        fs.writeFileSync(testFile, 'Test video content for upload');
        console.log('✅ Archivo de prueba creado:', testFile);
        
        // Crear FormData
        const form = new FormData();
        form.append('video', fs.createReadStream(testFile));
        
        // Hacer la petición
        const response = await fetch('http://localhost:4321/api/admin/upload-video', {
            method: 'POST',
            body: form,
            headers: {
                'Cookie': 'admin_session=test_session' // Simular sesión de admin
            }
        });
        
        console.log('📤 Respuesta del servidor:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Video subido exitosamente:');
            console.log('- URL:', result.videoUrl);
            console.log('- Archivo:', result.fileName);
            console.log('- Tamaño:', result.fileSize, 'bytes');
        } else {
            const error = await response.text();
            console.log('❌ Error:', error);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testUpload();
