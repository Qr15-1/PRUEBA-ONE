import { paymentQueries } from '../../../lib/database.js';

export async function GET({ url }) {
  try {
    const userEmail = url.searchParams.get('email');
    const courseId = url.searchParams.get('courseId');
    
    if (!userEmail || !courseId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email y courseId requeridos' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Buscar pagos confirmados del usuario
    const userPayments = paymentQueries.getByUserEmail(userEmail);
    const confirmedPayments = userPayments.filter(p => p.status === 'confirmed');
    
    // Verificar si el curso está en algún pago confirmado
    let hasAccess = false;
    let paymentId = null;
    
    for (const payment of confirmedPayments) {
      const courseIds = JSON.parse(payment.course_ids);
      if (courseIds.includes(parseInt(courseId))) {
        hasAccess = true;
        paymentId = payment.id;
        break;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      hasAccess: hasAccess,
      paymentId: paymentId
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error verificando acceso al curso:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
