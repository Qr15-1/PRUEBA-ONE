import { authQueries } from '../../../lib/database.js';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token y contraseña son requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el token es válido y no ha expirado
    const user = await authQueries.getUserByResetToken(token);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token de recuperación inválido o expirado'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hashear la nueva contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Actualizar la contraseña y limpiar el token
    await authQueries.updateUserPassword(user.id, passwordHash);

    console.log(`✅ Contraseña restablecida para usuario: ${user.email}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
