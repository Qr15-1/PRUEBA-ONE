import { authQueries } from '../../../lib/database.js';

export async function POST({ request }) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'El email es requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el email existe en la base de datos
    const user = await authQueries.getUserByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return new Response(JSON.stringify({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás las instrucciones de recuperación'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar token de recuperación (en un sistema real, esto sería más complejo)
    const resetToken = generateResetToken();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos (simulado)
    await authQueries.updateUserResetToken(user.id, resetToken, resetExpiry);

    // En un sistema real, aquí enviarías un email con el enlace de recuperación
    console.log(`🔐 Token de recuperación para ${email}: ${resetToken}`);
    console.log(`📧 En un sistema real, se enviaría un email con el enlace: /reset-password?token=${resetToken}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Se han enviado las instrucciones de recuperación a tu email'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateResetToken() {
  // Generar un token aleatorio (en producción usar crypto.randomBytes)
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}
