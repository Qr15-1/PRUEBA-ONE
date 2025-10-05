// =================================================================
// API ENDPOINT: VERIFICAR SESIÓN DE ADMINISTRADOR
// =================================================================

import { adminQueries } from '../../../lib/database.js';

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

        // Buscar administrador por ID de sesión
        console.log('🔍 Buscando administrador con ID:', adminSession);
        const admin = adminQueries.findById(adminSession);
        console.log('👤 Administrador encontrado:', admin);
        
        if (!admin) {
            console.log('❌ Administrador no encontrado');
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

        console.log('✅ Administrador válido:', admin.username);
        return new Response(JSON.stringify({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
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
