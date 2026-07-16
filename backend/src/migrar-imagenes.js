/**
 * Script para descargar imágenes de Unsplash y guardarlas localmente
 * Las imágenes se organizan en carpetas por producto
 */
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs de imágenes por producto
const productosImagenes = [
  {
    nombre: 'auriculares-bluetooth',
    urls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80',
    ]
  },
  {
    nombre: 'zapatillas-deportivas',
    urls: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    ]
  },
  {
    nombre: 'reloj-inteligente',
    urls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1546868871-af0de0ae72f5?w=600&q=80',
    ]
  },
  {
    nombre: 'chaqueta-cuero',
    urls: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80',
    ]
  },
  {
    nombre: 'mochila-viajera',
    urls: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
    ]
  },
  {
    nombre: 'sartenes',
    urls: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&q=80',
    ]
  },
  {
    nombre: 'laptop-gamer',
    urls: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80',
    ]
  },
  {
    nombre: 'perfume',
    urls: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    ]
  },
  {
    nombre: 'camara-dslr',
    urls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80',
    ]
  },
  {
    nombre: 'yoga',
    urls: [
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    ]
  },
  {
    nombre: 'teclado-mecanico',
    urls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    ]
  },
  {
    nombre: 'robotica',
    urls: [
      'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80',
      'https://images.unsplash.com/photo-1560375121-5f7e3b90623f?w=600&q=80',
    ]
  },
];

const uploadsDir = path.join(__dirname, '../uploads');
const productosDir = path.join(uploadsDir, 'productos');

// Asegurar que los directorios existen
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });

function descargarImagen(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Manejar redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(destPath, () => {});
        return descargarImagen(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Error HTTP ${response.statusCode} para ${url}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) {
          console.log(`   ✅ ${path.basename(destPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve(destPath);
        } else {
          fs.unlink(destPath, () => {});
          reject(new Error(`Archivo muy pequeño: ${stats.size} bytes`));
        }
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function obtenerExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

async function migrarImagenes() {
  console.log('📥 Iniciando descarga de imágenes...\n');
  
  const resultados = [];

  for (const producto of productosImagenes) {
    const carpetaProducto = path.join(productosDir, producto.nombre);
    if (!fs.existsSync(carpetaProducto)) {
      fs.mkdirSync(carpetaProducto, { recursive: true });
    }

    console.log(`📁 ${producto.nombre}:`);
    const rutasLocales = [];

    for (let i = 0; i < producto.urls.length; i++) {
      const url = producto.urls[i];
      const ext = obtenerExtension(url);
      const nombreArchivo = `imagen-${i + 1}.${ext}`;
      const rutaDestino = path.join(carpetaProducto, nombreArchivo);

      const rutaRelativa = `/uploads/productos/${producto.nombre}/${nombreArchivo}`;

      try {
        // Verificar si ya existe
        if (fs.existsSync(rutaDestino) && fs.statSync(rutaDestino).size > 1000) {
          console.log(`   ${nombreArchivo} - ya existe`);
          rutasLocales.push(rutaRelativa);
          continue;
        }

        await descargarImagen(url, rutaDestino);
        rutasLocales.push(rutaRelativa);
      } catch (error) {
        console.log(`   ❌ Error descargando ${url}: ${error.message}`);
        // Usar placeholder
        rutasLocales.push(`/uploads/productos/${producto.nombre}/${nombreArchivo}`);
      }
    }

    resultados.push({
      carpeta: producto.nombre,
      imagenes: rutasLocales,
    });
    console.log('');
  }

  // Guardar mapa de imágenes para usarlo en seed
  const mapPath = path.join(__dirname, '../uploads/mapa-imagenes.json');
  fs.writeFileSync(mapPath, JSON.stringify(resultados, null, 2));
  console.log(`📝 Mapa de imágenes guardado en: uploads/mapa-imagenes.json`);

  // Crear placeholder por si alguna imagen falla
  crearPlaceholder();

  console.log('\n✅ Migración de imágenes completada!');
  console.log(`📂 Las imágenes están en: uploads/productos/`);
  console.log(`📄 Mapa guardado en: uploads/mapa-imagenes.json`);
}

function crearPlaceholder() {
  // Crear un placeholder SVG simple
  const placeholderDir = path.join(uploadsDir, 'placeholders');
  if (!fs.existsSync(placeholderDir)) fs.mkdirSync(placeholderDir, { recursive: true });

  const placeholderPath = path.join(placeholderDir, 'imagen-no-disponible.svg');
  if (!fs.existsSync(placeholderPath)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3f4f6"/>
      <g transform="translate(200,200)">
        <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#d1d5db"/>
        <circle cx="0" cy="0" r="15" fill="#9ca3af"/>
        <path d="M-20 20 L0 5 L20 20" stroke="#9ca3af" fill="none" stroke-width="3"/>
      </g>
      <text x="200" y="260" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Imagen no disponible</text>
    </svg>`;
    fs.writeFileSync(placeholderPath, svg);
  }
}

migrarImagenes().catch(console.error);