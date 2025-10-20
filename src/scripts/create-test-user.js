import { userQueries } from '../lib/database.js';
import { createHash } from 'crypto';

// Crear usuario de prueba
const testUser = {
    firstName: 'Usuario',
    lastName: 'Prueba',
    email: 'test@rojasfitt.com',
    passwordHash: createHash('sha256').update('123456').digest('hex'),
    newsletter: 1
};

try {
    // Verificar si el usuario ya existe
    const existingUser = userQueries.findByEmail(testUser.email);
    
    if (existingUser) {
        console.log('✅ Usuario de prueba ya existe:', existingUser.email);
    } else {
        // Crear usuario
        const result = userQueries.create(testUser);
        
        if (result.lastInsertRowid) {
            console.log('✅ Usuario de prueba creado exitosamente:');
            console.log('   Email:', testUser.email);
            console.log('   Contraseña: 123456');
            console.log('   ID:', result.lastInsertRowid);
        } else {
            console.log('❌ Error al crear usuario de prueba');
        }
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}