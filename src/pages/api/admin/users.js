// =================================================================
// API ENDPOINT: OBTENER USUARIOS REGISTRADOS
// =================================================================

import { db, userQueries, adminQueries } from '../../../lib/database.js';

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

        // Obtener todos los usuarios (sin contraseñas)
        const users = db.prepare(`
            SELECT 
                id, 
                first_name, 
                last_name, 
                email, 
                phone, 
                newsletter, 
                created_at, 
                updated_at
            FROM users 
            ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify({
            success: true,
            users: users
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error en API admin users:', error);
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
