// =================================================================
// API ENDPOINT: LOGOUT DE ADMINISTRADOR
// =================================================================

export async function POST({ cookies }) {
    try {
        const adminSession = cookies.get('admin_session')?.value;
        
        if (!adminSession) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No hay sesión de admin activa'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Crear respuesta que elimina la cookie de admin
        const response = new Response(JSON.stringify({
            success: true,
            message: 'Sesión de admin cerrada exitosamente'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Eliminar cookie de sesión de admin
        response.headers.set('Set-Cookie', 
            'admin_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/'
        );

        return response;
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
