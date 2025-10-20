// =================================================================
// API ENDPOINT: ESTADÍSTICAS DE ADMINISTRACIÓN
// =================================================================

import { utils, adminQueries } from '../../../lib/database.js';

export async function GET({ cookies }) {
    try {
        // Verificar sesión de admin
        const adminSession = cookies.get('admin_session')?.value;
        
        if (!adminSession) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No autorizado'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Verificar que el administrador existe
        const admin = adminQueries.findById(adminSession);
        if (!admin) {
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

        // Obtener estadísticas
        const stats = utils.getAdminStats();

        return new Response(JSON.stringify({
            success: true,
            stats: stats
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error en API admin stats:', error);
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
