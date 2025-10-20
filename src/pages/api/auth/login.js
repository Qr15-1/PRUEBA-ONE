import { userQueries, sessionQueries } from '../../../lib/database.js';
import { verifyPassword, generateSessionToken, generateExpirationDate } from '../../../lib/auth.js';
import { randomBytes } from 'crypto';

export async function POST({ request }) {
    try {
        const { email, password, rememberMe } = await request.json();

        // Validar datos de entrada
        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email y contraseña son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Buscar usuario por email
        const user = userQueries.findByEmail(email);
        
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Credenciales incorrectas'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar contraseña usando el método correcto
        if (!verifyPassword(password, user.password_hash)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Credenciales incorrectas'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generar token de sesión usando la función correcta
        const sessionToken = generateSessionToken();
        const expirationDays = rememberMe ? 30 : 1; // 30 días si "recordarme", 1 día si no
        const expiresAt = generateExpirationDate(expirationDays);
        
        // Crear sesión en la base de datos
        sessionQueries.create(user.id, sessionToken, expiresAt);
        
        // Crear cookie de sesión
        const cookieOptions = [
            `user_session=${sessionToken}`,
            'HttpOnly',
            'Secure',
            'SameSite=Strict',
            'Path=/'
        ];

        // Si rememberMe está marcado, hacer la cookie más duradera
        if (rememberMe) {
            cookieOptions.push('Max-Age=2592000'); // 30 días
        } else {
            cookieOptions.push('Max-Age=86400'); // 1 día
        }

        // Preparar respuesta
        const response = new Response(JSON.stringify({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                newsletter: user.newsletter,
                created_at: user.created_at
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Set-Cookie': cookieOptions.join('; ')
            }
        });

        return response;

    } catch (error) {
        console.error('Error en login:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}