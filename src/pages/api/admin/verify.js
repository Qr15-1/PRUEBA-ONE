// =================================================================
// API ENDPOINT: VERIFICAR SESIÓN DE ADMINISTRADOR
// =================================================================

import { adminSessionQueries } from '../../../lib/database.js';

export async function GET({ cookies }) {
    try {
        console.log('🔍 Verificando sesión de administrador...');
        const adminSession = cookies.get('admin_session')?.value;
        console.log('🍪 Cookie de sesión:', adminSession);
        
        if (!adminSession) {
            console.log('❌ No hay cookie de sesión');
            return new Response(JSON.stringify({
                success: false,
                error: 'No hay sesión de administrador activa'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Buscar sesión de administrador por token
        console.log('🔍 Buscando sesión con token:', adminSession.substring(0, 10) + '...');
        const session = adminSessionQueries.findByToken(adminSession);
        console.log('🔍 Sesión encontrada:', session ? 'Sí' : 'No');
        
        if (!session) {
            console.log('❌ Sesión no encontrada');
            return new Response(JSON.stringify({
                success: false,
                error: 'Sesión de administrador inválida'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        console.log('✅ Sesión válida para admin:', session.username);
        return new Response(JSON.stringify({
            success: true,
            admin: {
                id: session.admin_id,
                username: session.username,
                email: session.email
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('❌ Error en API admin verify:', error);
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
