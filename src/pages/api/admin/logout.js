// =================================================================
// API ENDPOINT: LOGOUT DE ADMINISTRADOR
// =================================================================

import { logoutAdmin } from '../../../lib/auth.js';

export async function POST({ request, cookies }) {
    try {
        // Obtener el token de sesión de admin de las cookies
        const adminSessionToken = cookies.get('admin_session')?.value;
        
        if (!adminSessionToken) {
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

        // Cerrar sesión
        const result = await logoutAdmin(adminSessionToken);

        if (result.success) {
            // Crear respuesta y limpiar cookie
            const response = new Response(JSON.stringify({
                success: true,
                message: result.message
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Limpiar cookie de sesión de admin
            response.headers.set('Set-Cookie', 
                'admin_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/'
            );

            return response;
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: result.error
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (error) {
        console.error('Error en API admin logout:', error);
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