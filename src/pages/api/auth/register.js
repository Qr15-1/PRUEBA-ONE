import { userQueries } from '../../../lib/database.js';
import { createHash, randomBytes } from 'crypto';

export async function POST({ request }) {
    try {
        const { name, email, password, confirmPassword, newsletter } = await request.json();

        // Validar datos de entrada
        if (!name || !email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar confirmación de contraseña
        if (typeof confirmPassword === 'undefined') {
            return new Response(JSON.stringify({
                success: false,
                message: 'Debes confirmar la contraseña'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (password !== confirmPassword) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Las contraseñas no coinciden'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Formato de email inválido'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return new Response(JSON.stringify({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = userQueries.findByEmail(email);
        if (existingUser) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Ya existe una cuenta con este email'
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hashear contraseña
        const hashedPassword = createHash('sha256').update(password).digest('hex');

        // Dividir el nombre en first_name y last_name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Crear usuario
        const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            newsletter: newsletter ? 1 : 0
        };

        const result = userQueries.create(userData);

        if (result.lastInsertRowid) {
            // Generar token de sesión
            const sessionToken = randomBytes(32).toString('hex');
            
            // Crear cookie de sesión
            const cookieOptions = [
                `user_session=${sessionToken}`,
                'HttpOnly',
                'Secure',
                'SameSite=Strict',
                'Path=/',
                'Max-Age=86400' // 1 día
            ];

            // Obtener datos del usuario creado
            const newUser = userQueries.findById(result.lastInsertRowid);

            return new Response(JSON.stringify({
                success: true,
                message: 'Cuenta creada exitosamente',
                user: {
                    id: newUser.id,
                    name: `${newUser.first_name} ${newUser.last_name}`,
                    email: newUser.email,
                    newsletter: newUser.newsletter,
                    created_at: newUser.created_at
                }
            }), {
                status: 201,
                headers: { 
                    'Content-Type': 'application/json',
                    'Set-Cookie': cookieOptions.join('; ')
                }
            });
        } else {
            throw new Error('Error al crear usuario');
        }

    } catch (error) {
        console.error('Error en registro:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}