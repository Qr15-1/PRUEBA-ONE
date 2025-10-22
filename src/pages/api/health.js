// =================================================================
// HEALTH CHECK ENDPOINT PARA RENDER
// =================================================================
// Este endpoint es solo para que Render verifique que el servidor 
// está vivo y funcionando correctamente.

import { db } from '../../lib/database.js';

export async function GET() {
  try {
    console.log('🏥 Health check iniciado...');
    
    // Verificar que la base de datos esté conectada
    const testQuery = db.prepare('SELECT 1 as test');
    const result = testQuery.get();
    
    if (!result || result.test !== 1) {
      throw new Error('Base de datos no responde correctamente');
    }
    
    console.log('✅ Health check exitoso - Servidor y BD funcionando');
    
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'Server is healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('❌ Health check falló:', error.message);
    
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: 'Server is unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 503, // Service Unavailable
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
