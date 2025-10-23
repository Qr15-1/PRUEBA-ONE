# 📐 GUÍA COMPLETA DE MEDIDAS PARA IMÁGENES Y VIDEOS
## RojasFitt - Optimización Visual

---

## 🎯 RESUMEN RÁPIDO

| Elemento | Ancho | Alto | Ratio | Formato |
|----------|-------|------|-------|---------|
| **Hero Slider (Fondo)** | 1920px | 1080px | 16:9 | JPG/WebP |
| **Hero Slider (Tarjetas)** | 500px | 600px | 5:6 | JPG/WebP |
| **Tarjetas de Cursos** | 600px | 400px | 3:2 | JPG/WebP |
| **Imagen Curso Individual** | 640px | 360px | 16:9 | JPG/WebP |
| **Videos (Cursos)** | 1920px | 1080px | 16:9 | MP4 |
| **Miniatura Curso** | 100px | 100px | 1:1 | JPG/WebP |

---

## 📸 1. IMÁGENES DEL HERO SLIDER (Página de Inicio)

### 🖼️ **Fondo del Slider**
- **Dimensiones:** `1920x1080px` (Full HD)
- **Aspect Ratio:** 16:9
- **Formato:** JPG o WebP
- **Peso máximo:** 300KB
- **Calidad:** 80-85%
- **Notas:** 
  - Se aplica un filtro de `brightness(0.7)` automáticamente
  - Usa imágenes oscuras o de alto contraste
  - La imagen se redimensiona con `object-fit: cover`

### 🎴 **Tarjetas del Carrusel**
- **Dimensiones Desktop:** `500x600px` (retrato)
- **Dimensiones Tablet:** `360x432px`
- **Dimensiones Mobile:** `200x240px`
- **Aspect Ratio:** 5:6 (vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 150KB
- **Calidad:** 80%
- **Notas:**
  - La imagen debe tener texto legible abajo (gradiente oscuro)
  - Se muestra `object-fit: cover`

---

## 🎓 2. IMÁGENES DE CURSOS

### 📋 **Tarjetas en /cursos**
- **Dimensiones recomendadas:** `600x400px`
- **Dimensiones mínimas:** `450x300px`
- **Aspect Ratio:** 3:2
- **Formato:** JPG o WebP
- **Peso máximo:** 200KB
- **Calidad:** 80-85%
- **Contenedor CSS:**
  - Desktop: `height: 140px` (auto width)
  - Tablet: `height: 180px`
  - Mobile: `height: 200px`
- **Notas:**
  - Zoom en hover: `scale(1.05)`
  - Espacio para badge de estado (superior izquierda)
  - Espacio para icono de carrito (superior derecha)

### 🎯 **Imagen Individual del Curso (/curso/[slug])**

#### Tarjeta de Compra Lateral (Sidebar)
- **Dimensiones:** `640x360px`
- **Aspect Ratio:** 16:9
- **Formato:** JPG o WebP
- **Peso máximo:** 150KB
- **Contenedor CSS:** `height: 160px`
- **Notas:**
  - Se muestra en la tarjeta de compra fija a la derecha
  - `object-fit: cover`

---

## 🎬 3. VIDEOS DE CURSOS

### 📹 **Videos de Módulos**

#### Videos Locales (MP4)
- **Resolución recomendada:** `1920x1080px` (Full HD)
- **Resolución mínima:** `1280x720px` (HD)
- **Aspect Ratio:** 16:9
- **Formato:** MP4 (H.264)
- **Codec de video:** H.264
- **Codec de audio:** AAC
- **Bitrate video:** 2500-4000 kbps
- **Bitrate audio:** 128-192 kbps
- **FPS:** 24-30 fps
- **Peso máximo:** ~~100MB~~ **SIN LÍMITE** ✅ (puedes subir videos de cualquier tamaño)
- **Duración recomendada:** 5-15 minutos

#### Videos Externos (YouTube, Vimeo)
- **URL formato YouTube:** `https://www.youtube.com/embed/VIDEO_ID`
- **URL formato Vimeo:** `https://player.vimeo.com/video/VIDEO_ID`
- **Aspect Ratio:** 16:9
- **Contenedor:** Responsive (iframe fluid)

### 🎨 **Reproductor de Video**
- **Clase:** `video-js vjs-fluid`
- **Estilos:** 
  - Border radius: 12px
  - Big play button: 80x80px, verde (#99FF00)
  - Controles personalizados con color de marca

---

## 🖼️ 4. IMÁGENES MINIATURA

### 🔸 **Checkout / Carrito**
- **Dimensiones:** `100x100px`
- **Aspect Ratio:** 1:1
- **Formato:** JPG o WebP
- **Peso máximo:** 20KB
- **Contenedor CSS:**
  - Desktop: `50x50px`
  - Mobile: `60x60px`

### 🔸 **Admin Panel**
- **Dimensiones:** `320x180px`
- **Aspect Ratio:** 16:9
- **Altura contenedor:** `160px`

---

## ⚙️ 5. CONFIGURACIÓN DE EXPORTACIÓN

### 📷 **Para Photoshop**
```
Archivo > Exportar > Guardar para Web (heredado)
- Formato: JPEG
- Calidad: 80-85
- Optimizado: ✓
- Convertir a sRGB: ✓
- Metadatos: Ninguno
```

### 🎨 **Para Canva/Figma**
```
- Tipo: JPG
- Calidad: Alta
- Comprimir: Sí
- Escala: 2x para retina (opcional)
```

### 🎬 **Para Videos (Adobe Premiere/DaVinci Resolve)**
```
Formato: H.264 (MP4)
Preajuste: YouTube 1080p Full HD
Resolución: 1920x1080
Frame Rate: 30 fps
Bitrate Encoding: VBR, 2 pass
Target Bitrate: 3000 kbps
Maximum Bitrate: 4000 kbps
Audio: AAC, 192 kbps, 48kHz
```

### 🔧 **Para Handbrake (Compresión de video)**
```
Preajuste: Fast 1080p30
Calidad: RF 22-24
Encoder: H.264 (x264)
Framerate: 30 fps constant
Audio: AAC 160 kbps
```

---

## 🚀 6. HERRAMIENTAS RECOMENDADAS

### 🖼️ **Optimización de Imágenes**
1. **TinyPNG** (https://tinypng.com/) - Compresión con pérdida mínima
2. **Squoosh** (https://squoosh.app/) - Google, muy potente
3. **ImageOptim** (Mac) - Optimización local
4. **RIOT** (Windows) - Optimizador local

### 🎬 **Compresión de Videos**
1. **Handbrake** (https://handbrake.fr/) - Gratis, muy potente
2. **FFmpeg** - Línea de comandos (avanzado)
3. **CloudConvert** - Online
4. **Adobe Media Encoder** - Profesional

### 📐 **Redimensionamiento Batch**
1. **Bulk Resize Photos** (https://bulkresizephotos.com/)
2. **IrfanView** (Windows) - Batch conversion
3. **XnConvert** (Multi-plataforma)

---

## 💡 7. TIPS Y MEJORES PRÁCTICAS

### ✅ **Para Imágenes**
- ✓ Usa WebP cuando sea posible (50% más ligero que JPG)
- ✓ Mantén aspect ratio consistente en todo el sitio
- ✓ Comprime SIEMPRE antes de subir
- ✓ Usa nombres descriptivos: `curso-cardio-roger.jpg`
- ✓ Evita espacios en nombres de archivo: usa `-` o `_`
- ✓ Prueba en dispositivos reales (móvil, tablet, desktop)

### ✅ **Para Videos**
- ✓ Usa siempre MP4 con H.264 (máxima compatibilidad)
- ✓ Graba en 1080p mínimo
- ✓ Iluminación adecuada y audio claro
- ✓ Divide videos largos en módulos de 5-15 min
- ✓ Sube a YouTube si el video es muy pesado (>100MB)
- ✓ Usa miniaturas personalizadas atractivas

### ⚠️ **Errores Comunes**
- ✗ Subir imágenes de 5000px de ancho (innecesario)
- ✗ Usar PNG para fotos (muy pesado)
- ✗ Videos sin comprimir (GB de tamaño)
- ✗ Aspect ratios incorrectos (se deforman)
- ✗ Nombres de archivo con espacios o caracteres especiales

---

## 📱 8. RESPONSIVE BREAKPOINTS

Tu sitio tiene estos breakpoints:

| Dispositivo | Ancho | Ajustes |
|-------------|-------|---------|
| **Desktop** | > 1024px | Imágenes full size |
| **Tablet** | 768-1024px | Tarjetas: 180-220px alto |
| **Mobile Large** | 480-768px | Tarjetas: 140-180px alto |
| **Mobile** | 360-480px | Tarjetas: 100-140px alto |
| **Mobile Small** | < 360px | Tarjetas: 70-100px alto |

### 📐 **Imágenes Responsive (Opcional)**
Puedes crear múltiples versiones:
```
curso-hero-1920.jpg  (Desktop)
curso-hero-1280.jpg  (Tablet)
curso-hero-768.jpg   (Mobile)
```

---

## 🎯 9. CHECKLIST ANTES DE SUBIR

### Imágenes
- [ ] Dimensiones correctas según la tabla
- [ ] Aspect ratio correcto
- [ ] Peso < límite recomendado
- [ ] Formato JPG o WebP
- [ ] Nombre de archivo descriptivo
- [ ] Comprimida (TinyPNG, Squoosh)
- [ ] Probada en la web

### Videos
- [ ] Resolución 1080p o 720p
- [ ] Formato MP4 (H.264)
- [ ] Peso < 100MB
- [ ] Audio claro y sincronizado
- [ ] Duración 5-15 minutos
- [ ] Comprimido (Handbrake)
- [ ] URL correcta si es externo

---

## 🛠️ 10. COMANDOS ÚTILES

### FFmpeg (Comprimir video)
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k output.mp4
```

### ImageMagick (Redimensionar imagen)
```bash
convert input.jpg -resize 600x400^ -gravity center -extent 600x400 output.jpg
```

### Bulk Resize (Bash)
```bash
for i in *.jpg; do convert "$i" -resize 600x400^ -gravity center -extent 600x400 "resized_$i"; done
```

---

## 📊 11. COMPARATIVA DE FORMATOS

| Formato | Ventajas | Desventajas | Uso Recomendado |
|---------|----------|-------------|-----------------|
| **JPG** | Universal, pequeño | Pierde calidad | Fotos, imágenes con gradientes |
| **PNG** | Sin pérdida, transparencia | Muy pesado | Logos, gráficos, iconos |
| **WebP** | 30-50% más ligero que JPG | No todos los navegadores | Fotos modernas (con fallback) |
| **SVG** | Escalable, muy ligero | Solo vectores | Iconos, logos simples |
| **MP4** | Universal, comprimido | Calidad variable | Videos de cursos |
| **WebM** | Muy ligero | Compatibilidad limitada | Videos web (con fallback) |

---

## 🎨 12. PALETA DE COLORES DEL SITIO

Para crear imágenes coherentes con tu marca:

```css
Verde Principal: #99FF00 (rgba(153, 255, 0))
Verde Oscuro: #7ACC00
Fondo Oscuro: #0a0a0a
Fondo Secundario: #1a1a1a
Texto Principal: #ffffff
Texto Secundario: #b0b0b0
Borde: #333333
Acento Verde: #22c55e - #16a34a
```

---

## 📞 SOPORTE

Si tienes dudas sobre las medidas o necesitas ayuda:
1. Revisa esta guía primero
2. Prueba en dispositivos reales
3. Usa las herramientas recomendadas
4. Mantén copias de respaldo de originales

---

**Última actualización:** Octubre 2025
**Versión:** 1.0

**¡Listo! Con esta guía tus imágenes y videos se verán INCREÍBLES! 🚀✨**

