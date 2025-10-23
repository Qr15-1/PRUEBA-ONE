import { paymentQueries, courseAccessQueries, userQueries } from '../../../../../lib/database.js';

export async function POST({ params }) {
  try {
    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return new Response(JSON.stringify({ success: false, error: 'ID de pago inválido' }), { status: 400 });
    }

    // Obtener datos del pago ANTES de confirmar
    const payment = paymentQueries.getById(paymentId);
    
    if (!payment) {
      return new Response(JSON.stringify({ success: false, error: 'Pago no encontrado' }), { status: 404 });
    }

    if (payment.status === 'confirmed') {
      return new Response(JSON.stringify({ success: false, error: 'Este pago ya fue confirmado' }), { status: 400 });
    }

    // Obtener usuario
    const user = userQueries.findByEmail(payment.user_email);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Usuario no encontrado' }), { status: 404 });
    }

    // Parsear IDs de cursos
    const courseIds = JSON.parse(payment.course_ids);
    const courseTitles = JSON.parse(payment.course_titles);

    console.log('✅ Confirmando pago #', paymentId);
    console.log('👤 Usuario:', user.email, '(ID:', user.id, ')');
    console.log('📚 Cursos:', courseIds);

    // 1. Confirmar el pago
    const result = paymentQueries.confirm(paymentId);

    if (result.changes > 0) {
      console.log(`✅ Pago #${paymentId} confirmado exitosamente.`);
      
      // 2. Otorgar acceso a todos los cursos comprados
      let accessGranted = 0;
      for (let i = 0; i < courseIds.length; i++) {
        const courseId = parseInt(courseIds[i]);
        try {
          const accessResult = courseAccessQueries.grant(user.id, courseId, paymentId);
          console.log(`✅ Acceso otorgado: Usuario ${user.id} → Curso ${courseId} (${courseTitles[i]})`);
          accessGranted++;
        } catch (error) {
          console.log(`ℹ️ Usuario ya tenía acceso al curso ${courseId} o error:`, error.message);
        }
      }

      console.log(`🎉 Acceso otorgado a ${accessGranted} curso(s)`);
      
      // 3. Aquí puedes agregar lógica adicional:
      // - Enviar email al usuario notificando la confirmación
      // - Crear notificaciones en la app
      // - Registrar en logs
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Pago confirmado y acceso otorgado',
        payment: payment,
        coursesGranted: accessGranted
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'No se pudo confirmar el pago' }), { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
