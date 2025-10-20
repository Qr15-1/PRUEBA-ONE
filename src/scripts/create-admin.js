// =================================================================
// SCRIPT PARA CREAR EL PRIMER ADMINISTRADOR
// =================================================================

import { createAdmin } from '../lib/auth.js';

async function createFirstAdmin() {
    try {
        console.log('🔐 Creando primer administrador...');
        
        const adminData = {
            username: 'admin',
            email: 'admin@rojasfitt.com',
            password: 'admin123',
            role: 'superadmin'
        };

        const result = await createAdmin(adminData);
        
        if (result.success) {
            console.log('✅ Administrador creado exitosamente!');
            console.log('📧 Email:', adminData.email);
            console.log('👤 Username:', adminData.username);
            console.log('🔑 Password:', adminData.password);
            console.log('');
            console.log('🌐 Accede al panel de administración en:');
            console.log('   http://localhost:4321/admin/login');
        } else {
            console.error('❌ Error al crear administrador:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createFirstAdmin();
}

export { createFirstAdmin };
