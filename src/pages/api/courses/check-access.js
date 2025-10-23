import { courseAccessQueries, userQueries } from '../../../lib/database.js';

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
    
    // Buscar usuario por email
    const user = userQueries.findByEmail(userEmail);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: true,
        hasAccess: false,
        message: 'Usuario no encontrado'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar acceso directo desde la tabla user_course_access
    const access = courseAccessQueries.hasAccess(user.id, parseInt(courseId));
    
    if (access) {
      console.log(`✅ Usuario ${userEmail} tiene acceso al curso ${courseId} (Payment ID: ${access.payment_id})`);
      return new Response(JSON.stringify({ 
        success: true,
        hasAccess: true,
        paymentId: access.payment_id,
        grantedAt: access.granted_at
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.log(`❌ Usuario ${userEmail} NO tiene acceso al curso ${courseId}`);
      return new Response(JSON.stringify({ 
        success: true,
        hasAccess: false
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
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
