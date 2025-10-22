import { paymentQueries } from '../../../../../lib/database.js';

export async function POST({ params }) {
  try {
    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return new Response(JSON.stringify({ success: false, error: 'ID de pago inválido' }), { status: 400 });
    }

    const result = paymentQueries.reject(paymentId);

    if (result.changes > 0) {
      console.log(`❌ Pago #${paymentId} rechazado.`);
      
      // Aquí podrías agregar lógica adicional como:
      // - Enviar email al usuario explicando el rechazo
      // - Devolver el dinero si es necesario
      
      return new Response(JSON.stringify({ success: true, message: 'Pago rechazado' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Pago no encontrado o ya procesado' }), { status: 404 });
    }
  } catch (error) {
    console.error('❌ Error al rechazar pago:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}