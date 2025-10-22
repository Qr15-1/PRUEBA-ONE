import { paymentQueries } from '../../../../../lib/database.js';

export async function POST({ params }) {
  try {
    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return new Response(JSON.stringify({ success: false, error: 'ID de pago inválido' }), { status: 400 });
    }

    const result = paymentQueries.confirm(paymentId);

    if (result.changes > 0) {
      console.log(`✅ Pago #${paymentId} confirmado exitosamente.`);
      
      // Obtener datos del pago para actualizar el estado del usuario
      const payment = paymentQueries.getById(paymentId);
      if (payment) {
        // Actualizar localStorage del usuario (esto se hará en el frontend)
        console.log(`📧 Usuario ${payment.user_email} - Cursos confirmados:`, JSON.parse(payment.course_titles));
        
        // Aquí podrías agregar lógica adicional como:
        // - Enviar email al usuario notificando la confirmación
        // - Actualizar estadísticas
        // - Crear notificaciones
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Pago confirmado',
        payment: payment
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Pago no encontrado o ya confirmado' }), { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}