import { userQueries } from '../lib/database.js';
import bcrypt from 'bcryptjs';

// Datos de usuarios de prueba
const testUsers = [
    {
        firstName: 'Ana',
        lastName: 'García',
        email: 'ana.garcia@email.com',
        phone: '+34 600 123 456',
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+34 600 234 567',
        password: 'password123',
        newsletter: false
    },
    {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@email.com',
        phone: '+34 600 345 678',
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'David',
        lastName: 'Martín',
        email: 'david.martin@email.com',
        phone: null,
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'Laura',
        lastName: 'Sánchez',
        email: 'laura.sanchez@email.com',
        phone: '+34 600 456 789',
        password: 'password123',
        newsletter: false
    },
    {
        firstName: 'Roberto',
        lastName: 'Fernández',
        email: 'roberto.fernandez@email.com',
        phone: '+34 600 567 890',
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'Isabel',
        lastName: 'González',
        email: 'isabel.gonzalez@email.com',
        phone: null,
        password: 'password123',
        newsletter: false
    },
    {
        firstName: 'Miguel',
        lastName: 'Pérez',
        email: 'miguel.perez@email.com',
        phone: '+34 600 678 901',
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'Carmen',
        lastName: 'Ruiz',
        email: 'carmen.ruiz@email.com',
        phone: '+34 600 789 012',
        password: 'password123',
        newsletter: true
    },
    {
        firstName: 'Javier',
        lastName: 'Díaz',
        email: 'javier.diaz@email.com',
        phone: '+34 600 890 123',
        password: 'password123',
        newsletter: false
    }
];

async function populateUsers() {
    try {
        console.log('🚀 Iniciando población de usuarios...\n');

        // Verificar si ya existen usuarios
        const existingUsers = userQueries.getAll();
        if (existingUsers.length > 0) {
            console.log(`⚠️  Ya existen ${existingUsers.length} usuarios en la base de datos.`);
            console.log('¿Deseas continuar y agregar más usuarios? (Ctrl+C para cancelar)');
            
            // Esperar 3 segundos para que el usuario pueda cancelar
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        let created = 0;
        let errors = 0;

        for (const userData of testUsers) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = userQueries.findByEmail(userData.email);
                if (existingUser) {
                    console.log(`⏭️  Usuario ${userData.email} ya existe, saltando...`);
                    continue;
                }

                // Hash de la contraseña
                const passwordHash = await bcrypt.hash(userData.password, 10);

                // Crear usuario
                const result = userQueries.create({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                    passwordHash: passwordHash,
                    newsletter: userData.newsletter
                });

                if (result.changes > 0) {
                    console.log(`✅ Usuario creado: ${userData.firstName} ${userData.lastName} (${userData.email})`);
                    created++;
                } else {
                    console.log(`❌ Error al crear usuario: ${userData.email}`);
                    errors++;
                }
            } catch (error) {
                console.log(`❌ Error al crear usuario ${userData.email}:`, error.message);
                errors++;
            }
        }

        console.log('\n📊 Resumen de la población:');
        console.log(`✅ Usuarios creados: ${created}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📈 Total de usuarios en la base de datos: ${userQueries.getAll().length}`);

        // Mostrar estadísticas
        const allUsers = userQueries.getAll();
        const activeUsers = allUsers.filter(user => user.is_active === 1).length;
        const newsletterUsers = allUsers.filter(user => user.newsletter === 1).length;
        const usersWithPhone = allUsers.filter(user => user.phone && user.phone.trim() !== '').length;

        console.log('\n📈 Estadísticas de usuarios:');
        console.log(`👥 Total: ${allUsers.length}`);
        console.log(`✅ Activos: ${activeUsers}`);
        console.log(`📧 Con newsletter: ${newsletterUsers}`);
        console.log(`📞 Con teléfono: ${usersWithPhone}`);

    } catch (error) {
        console.error('❌ Error durante la población de usuarios:', error);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    populateUsers();
}

export { populateUsers };
