import { paymentQueries } from '../../../lib/database.js';

export async function GET({ url }) {
  try {
    const userEmail = url.searchParams.get('email');
    
    if (!userEmail) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email requerido' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Buscar pagos del usuario
    const userPayments = paymentQueries.getByUserEmail(userEmail);
    
    // Separar por estado
    const pendingPayments = userPayments.filter(p => p.status === 'pending');
    const confirmedPayments = userPayments.filter(p => p.status === 'confirmed');
    
    return new Response(JSON.stringify({ 
      success: true,
      pending: pendingPayments,
      confirmed: confirmedPayments
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error verificando estado de pagos:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

