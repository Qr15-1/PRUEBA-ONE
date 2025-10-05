import { defineMiddleware } from 'astro:middleware';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Si es un archivo estático
  const isStaticFile = pathname.startsWith('/videos/') ||
                       pathname.startsWith('/images/') ||
                       pathname.startsWith('/css/') ||
                       pathname.startsWith('/js/');

  if (isStaticFile) {
    const filePath = join(process.cwd(), 'public', pathname);

    // --- LÍNEA DE DEPURACIÓN AÑADIDA ---
    console.log(`[Middleware] Intentando servir archivo estático: ${filePath}`);

    try {
      const fileBuffer = await readFile(filePath);
      
      let contentType = 'application/octet-stream';
      if (pathname.endsWith('.mp4')) contentType = 'video/mp4';
      else if (pathname.endsWith('.webm')) contentType = 'video/webm';
      else if (pathname.endsWith('.ogg')) contentType = 'video/ogg';
      else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (pathname.endsWith('.png')) contentType = 'image/png';
      else if (pathname.endsWith('.css')) contentType = 'text/css';
      else if (pathname.endsWith('.js')) contentType = 'application/javascript';
      
      console.log(`[Middleware] Archivo encontrado. Sirviendo con Content-Type: ${contentType}`);
      
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (error) {
      // --- MENSAJE DE ERROR MEJORADO ---
      console.error(`[Middleware] ERROR: No se pudo encontrar o leer el archivo en la ruta: ${filePath}. Error original:`, error.code);
      return new Response('Archivo no encontrado', { status: 404 });
    }
  }

  // Para todas las demás rutas, continuar
  return next();
});