import { userQueries, courseQueries, orderQueries, orderItemQueries } from '../../../lib/database.js';

export async function POST({ request, cookies }) {
    try {
        console.log('💳 Procesando pago...');
        
        // Verificar autenticación del usuario
        const userSession = cookies.get('user_session')?.value;
        
        if (!userSession) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No hay sesión de usuario activa'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Obtener datos del usuario
        const user = userQueries.findBySessionToken(userSession);
        
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Sesión de usuario inválida'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Obtener datos del pago
        const { 
            paymentMethod, 
            cartItems, 
            total, 
            subtotal, 
            discount = 0,
            paymentData 
        } = await request.json();

        console.log('📝 Datos del pago:', {
            userId: user.id,
            paymentMethod,
            cartItemsCount: cartItems.length,
            total,
            subtotal,
            discount
        });

        // Validar datos requeridos
        if (!paymentMethod || !cartItems || cartItems.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Datos de pago incompletos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar que los cursos existan y estén activos
        for (const item of cartItems) {
            const course = courseQueries.findById(item.id);
            
            if (!course || course.is_active !== 1) {
                return new Response(JSON.stringify({
                    success: false,
                    message: `El curso "${item.title}" no está disponible`
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Procesar pago según el método
        let paymentResult;
        
        switch (paymentMethod) {
            case 'card':
                paymentResult = await processCardPayment(paymentData, total);
                break;
            case 'paypal':
                paymentResult = await processPayPalPayment(paymentData, total);
                break;
            default:
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Método de pago no válido'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

        if (!paymentResult.success) {
            return new Response(JSON.stringify({
                success: false,
                message: paymentResult.message || 'Error al procesar el pago'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear orden en la base de datos
        const orderData = {
            userId: user.id,
            total: total,
            status: 'completed'
        };

        const orderResult = orderQueries.create(orderData);
        const orderId = orderResult.lastInsertRowid;

        console.log('📋 Orden creada:', orderId);

        // Crear items de la orden
        for (const item of cartItems) {
            const orderItemData = {
                orderId: orderId,
                productId: item.id, // Usando productId para cursos
                quantity: 1,
                price: item.price
            };

            orderItemQueries.create(orderItemData);
        }

        console.log('✅ Pago procesado exitosamente:', {
            orderId,
            userId: user.id,
            total,
            items: cartItems.length
        });

        // Respuesta exitosa
        return new Response(JSON.stringify({
            success: true,
            message: 'Pago procesado exitosamente',
            orderId: orderId,
            paymentId: paymentResult.paymentId,
            total: total,
            courses: cartItems.map(item => ({
                id: item.id,
                title: item.title,
                slug: item.slug
            }))
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Error al procesar pago:', error);
        
        return new Response(JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Función para procesar pago con tarjeta (simulado)
async function processCardPayment(paymentData, amount) {
    console.log('💳 Procesando pago con tarjeta...', { amount });
    
    // Aquí se integraría con Stripe, PayPal, o el gateway de pagos real
    // Por ahora simulamos un pago exitoso
    
    // Validaciones básicas
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.cvv) {
        return {
            success: false,
            message: 'Datos de tarjeta incompletos'
        };
    }

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular éxito (en producción, aquí se haría la llamada real al gateway)
    return {
        success: true,
        paymentId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Pago con tarjeta procesado exitosamente'
    };
}

// Función para procesar pago con PayPal (simulado)
async function processPayPalPayment(paymentData, amount) {
    console.log('🅿️ Procesando pago con PayPal...', { amount });
    
    // Aquí se integraría con la API de PayPal
    // Por ahora simulamos un pago exitoso
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular éxito (en producción, aquí se haría la llamada real a PayPal)
    return {
        success: true,
        paymentId: `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Pago con PayPal procesado exitosamente'
    };
}

