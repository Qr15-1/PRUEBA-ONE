import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST({ request }) {
  try {
    const { amount, currency = 'usd', paymentMethodId, customerEmail, courseIds } = await request.json();
    
    console.log('💳 Procesando pago con Stripe:', { amount, currency, paymentMethodId, customerEmail, courseIds });
    
    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${request.headers.get('origin')}/checkout?success=true`,
      metadata: {
        customer_email: customerEmail,
        course_ids: JSON.stringify(courseIds),
        payment_type: 'stripe'
      }
    });
    
    console.log('✅ PaymentIntent creado:', paymentIntent.id);
    
    if (paymentIntent.status === 'succeeded') {
      // TODO: Actualizar base de datos con pago exitoso
      console.log('🎉 Pago exitoso!', paymentIntent.id);
      
      return new Response(JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        message: 'Pago procesado exitosamente'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.log('⚠️ Pago no completado:', paymentIntent.status);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'El pago no pudo ser procesado',
        status: paymentIntent.status
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error procesando pago con Stripe:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error interno del servidor'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
