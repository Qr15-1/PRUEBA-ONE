// =================================================================
// API ENDPOINT: LOGOUT DE USUARIO
// =================================================================

import { logoutUser } from '../../../lib/auth.js';

export async function POST({ request, cookies }) {
    try {
        const sessionToken = cookies.get('session_token')?.value;
        
        if (!sessionToken) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No hay sesión activa'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Hacer logout
        const result = await logoutUser(sessionToken);

        if (result.success) {
            // Crear respuesta que elimina la cookie
            const response = new Response(JSON.stringify({
                success: true,
                message: result.message
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Eliminar cookie de sesión
            response.headers.set('Set-Cookie', 
                'session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
            );

            return response;
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: result.error
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        console.error('Error en API logout:', error);
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
