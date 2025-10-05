// =================================================================
// API ENDPOINT: CREAR ADMINISTRADOR
// =================================================================

import { adminQueries } from '../../../lib/database.js';
import { createHash } from 'crypto';

export async function POST({ request }) {
    try {
        const { username, email, password } = await request.json();

        // Verificar si ya existe
        const existingAdmin = adminQueries.findByEmail(email);
        if (existingAdmin) {
            return new Response(JSON.stringify({
                success: false,
                message: 'El administrador ya existe',
                credentials: {
                    email: email,
                    username: existingAdmin.username,
                    password: 'admin123'
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear admin
        const hashedPassword = createHash('sha256').update(password).digest('hex');
        const result = adminQueries.create({
            username: username,
            email: email,
            passwordHash: hashedPassword
        });

        if (result.lastInsertRowid) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Administrador creado exitosamente',
                credentials: {
                    email: email,
                    username: username,
                    password: password
                }
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: 'Error al crear administrador'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error creando admin:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
