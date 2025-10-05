// =================================================================
// API ENDPOINT: LOGIN DE ADMINISTRADOR
// =================================================================

import { loginAdmin } from '../../../lib/auth.js';

export async function POST({ request, cookies }) {
    try {
        const data = await request.json();
        
        if (!data.username || !data.password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Username y contraseña son requeridos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Autenticar administrador
        const result = await loginAdmin(data.username, data.password);

        if (result.success) {
            // Crear cookie de sesión de admin
            const response = new Response(JSON.stringify({
                success: true,
                message: 'Login exitoso',
                admin: result.admin
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Establecer cookie de sesión de admin
            response.headers.set('Set-Cookie', 
                `admin_session=${result.admin.id}; HttpOnly; SameSite=Lax; Max-Age=86400; Path=/`
            );

            return response;
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: result.error
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        console.error('Error en API admin login:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
