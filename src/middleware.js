import { defineMiddleware } from 'astro:middleware';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(`[Middleware] Procesando petición: ${pathname}`);

  // Si es un archivo estático
  const isStaticFile = pathname.startsWith('/videos/') ||
                       pathname.startsWith('/images/') ||
                       pathname.startsWith('/css/') ||
                       pathname.startsWith('/js/') ||
                       pathname.startsWith('/favicon.svg');

  if (isStaticFile) {
    // Intentar múltiples rutas posibles
    const possiblePaths = [
      join(process.cwd(), 'public', pathname),
      join(process.cwd(), 'dist', 'client', pathname),
      join(process.cwd(), 'src', 'public', pathname)
    ];

    console.log(`[Middleware] Intentando servir archivo estático: ${pathname}`);

    for (const filePath of possiblePaths) {
      try {
        console.log(`[Middleware] Probando ruta: ${filePath}`);
        const fileBuffer = await readFile(filePath);

        let contentType = 'application/octet-stream';
        if (pathname.endsWith('.mp4')) contentType = 'video/mp4';
        else if (pathname.endsWith('.webm')) contentType = 'video/webm';
        else if (pathname.endsWith('.ogg')) contentType = 'video/ogg';
        else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (pathname.endsWith('.png')) contentType = 'image/png';
        else if (pathname.endsWith('.css')) contentType = 'text/css';
        else if (pathname.endsWith('.js')) contentType = 'application/javascript';
        else if (pathname.endsWith('.svg')) contentType = 'image/svg+xml';

        console.log(`[Middleware] ✅ Archivo encontrado en: ${filePath}`);

        return new Response(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (error) {
        console.log(`[Middleware] ❌ No encontrado en: ${filePath}`);
        continue;
      }
    }

    console.error(`[Middleware] ❌ Archivo no encontrado en ninguna ruta: ${pathname}`);
    return new Response('Archivo no encontrado', { status: 404 });
  }

  console.log(`[Middleware] Continuando con petición normal: ${pathname}`);
  return next();
});