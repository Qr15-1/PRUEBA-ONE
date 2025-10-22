import { paymentQueries } from '../../../lib/database.js';

export async function POST({ request }) {
  try {
    const paymentData = await request.json();
    
    console.log('💳 Datos recibidos en API de pagos:', paymentData);
    console.log('📷 Comprobante de pago recibido:', paymentData.payment_proof ? 'Sí (base64)' : 'No');
    if (paymentData.payment_proof) {
      console.log('📷 Tamaño del comprobante:', paymentData.payment_proof.length, 'caracteres');
    }
    
    // Validar datos requeridos
    if (!paymentData.user_id || !paymentData.user_email || !paymentData.user_name || 
        !paymentData.course_ids || !paymentData.course_titles || !paymentData.total_amount || 
        !paymentData.payment_method) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Faltan datos requeridos del pago' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Crear el pago en la base de datos
    console.log('💾 Intentando crear pago en BD...');
    const result = paymentQueries.create({
      user_id: paymentData.user_id,
      user_email: paymentData.user_email,
      user_name: paymentData.user_name,
      course_ids: paymentData.course_ids,
      course_titles: paymentData.course_titles,
      total_amount: paymentData.total_amount,
      payment_method: paymentData.payment_method,
      payment_proof: paymentData.payment_proof || null,
      reference_number: paymentData.reference_number || null,
      additional_notes: paymentData.additional_notes || null,
      status: 'pending'
    });
    
    console.log('💾 Resultado de crear pago:', result);
    
    if (result.changes > 0) {
      console.log(`✅ Pago creado exitosamente - ID: ${result.lastInsertRowid}`);
      
      // Aquí podrías agregar lógica adicional como:
      // - Enviar email al admin notificando el nuevo pago
      // - Enviar email al usuario confirmando la recepción
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Pago registrado exitosamente',
        paymentId: result.lastInsertRowid
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No se pudo crear el pago' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('❌ Error creando pago:', error);
    console.error('❌ Stack trace:', error.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Error interno del servidor: ${error.message}` 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
