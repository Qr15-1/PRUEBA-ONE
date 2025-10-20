// =================================================================
// HEALTH CHECK DETALLADO PARA DEBUGGING
// =================================================================
// Este endpoint proporciona información detallada sobre el estado
// de todos los componentes del sistema.

import { db } from '../../../lib/database.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const healthReport = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    components: {}
  };

  try {
    // 1. Verificar Base de Datos
    try {
      const testQuery = db.prepare('SELECT 1 as test');
      const result = testQuery.get();
      healthReport.components.database = {
        status: 'ok',
        message: 'Base de datos conectada correctamente',
        test_result: result
      };
    } catch (dbError) {
      healthReport.components.database = {
        status: 'error',
        message: 'Error en base de datos',
        error: dbError.message
      };
      healthReport.status = 'error';
    }

    // 2. Verificar Archivos Estáticos
    try {
      const cssPath = join(process.cwd(), 'dist', 'client', 'css', 'index.css');
      await readFile(cssPath);
      healthReport.components.static_files = {
        status: 'ok',
        message: 'Archivos estáticos accesibles',
        css_path: cssPath
      };
    } catch (staticError) {
      healthReport.components.static_files = {
        status: 'warning',
        message: 'Archivos estáticos no encontrados en dist/client',
        error: staticError.message
      };
    }

    // 3. Verificar Variables de Entorno
    healthReport.components.environment = {
      status: 'ok',
      message: 'Variables de entorno verificadas',
      database_path: process.env.DATABASE_PATH || 'No configurado',
      port: process.env.PORT || 'No configurado',
      node_env: process.env.NODE_ENV || 'No configurado'
    };

    // 4. Información del Sistema
    healthReport.system = {
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    };

    const statusCode = healthReport.status === 'ok' ? 200 : 503;
    
    return new Response(JSON.stringify(healthReport, null, 2), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    healthReport.status = 'error';
    healthReport.error = error.message;
    
    return new Response(JSON.stringify(healthReport, null, 2), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
