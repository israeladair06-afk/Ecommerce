/**
 * 🚀 SISTEMA DE INICIALIZACIÓN AUTOMÁTICA - ShopMax Ecommerce
 * 
 * Este script verifica si la base de datos ya está poblada.
 * Si NO hay datos: descarga imágenes y puebla la BD automáticamente.
 * Si YA hay datos: solo muestra un resumen.
 * 
 * Los compañeros solo necesitan:
 * 1. Tener MongoDB instalado y corriendo
 * 2. Ejecutar: cd backend && pnpm dev
 * 3. ¡Todo se crea solo!
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAÍZ = path.join(__dirname, '..', '..');

const UPLOADS_DIR = path.join(RAÍZ, 'uploads');
const PRODUCTOS_DIR = path.join(UPLOADS_DIR, 'productos');
const MAPA_PATH = path.join(UPLOADS_DIR, 'mapa-imagenes.json');

const PRODUCTOS = [
  {
    name: 'Auriculares Bluetooth Pro Max - Cancelación de Ruido',
    description: 'Auriculares inalámbricos premium con cancelación de ruido activa ANC. Batería de 30 horas, sonido envolvente 3D.',
    mrp: 299.99, price: 199.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80','https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80'],
    category: 'Electrónicos', inStock: true, rating: 4.8, numReviews: 2453,
    especificaciones: ['Cancelación de ruido activa', '30h de batería', 'Bluetooth 5.3', 'Almohadillas memory foam', 'Estuche de carga incluido'],
    destacado: true, envioGratis: true, garantia: '1 año',
  },
  {
    name: 'Zapatillas Deportivas Ultra Boost - Running',
    description: 'Zapatillas de running con tecnología de amortiguación avanzada. Suela de caucho resistente.',
    mrp: 159.99, price: 119.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'],
    category: 'Deportes', inStock: true, rating: 4.7, numReviews: 1832,
    especificaciones: ['Amortiguación Ultra Boost', 'Malla transpirable', 'Suela antideslizante', 'Peso ligero 250g'],
    destacado: true, envioGratis: true,
  },
  {
    name: 'Reloj Inteligente Series 5 - GPS + Salud',
    description: 'Smartwatch premium con monitor de frecuencia cardíaca, GPS integrado, pantalla AMOLED siempre activa.',
    mrp: 449.99, price: 349.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80','https://images.unsplash.com/photo-1546868871-af0de0ae72f5?w=600&q=80'],
    category: 'Electrónicos', inStock: true, rating: 4.9, numReviews: 3201,
    especificaciones: ['Pantalla AMOLED 1.5"', 'GPS integrado', 'Monitor cardíaco', 'Resistente 5ATM', 'Batería 7 días'],
    destacado: true, envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Chaqueta de Cuero Premium - Hombre',
    description: 'Chaqueta de cuero genuino 100% con diseño clásico motoquero. Forro interior de poliéster.',
    mrp: 299.99, price: 249.99,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80','https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80'],
    category: 'Ropa', inStock: true, rating: 4.6, numReviews: 987,
    especificaciones: ['Cuero genuino 100%', 'Cremallera YKK', 'Forro interior', 'Bolsillos con cierre'],
    destacado: true,
  },
  {
    name: 'Mochila Viajera 40L - Impermeable USB',
    description: 'Mochila viajera espaciosa con compartimento para laptop de 15.6", puerto de carga USB externo.',
    mrp: 89.99, price: 59.99,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80','https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80'],
    category: 'Hogar', inStock: true, rating: 4.5, numReviews: 1543,
    especificaciones: ['Capacidad 40L', 'Puerto USB', 'Impermeable', 'Compartimento laptop 15.6"'],
    envioGratis: true,
  },
  {
    name: 'Set de Sartenes Antiadherentes - 5 Piezas',
    description: 'Juego de 5 sartenes profesionales con recubrimiento de titanio antiadherente.',
    mrp: 199.99, price: 149.99,
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80','https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&q=80'],
    category: 'Hogar', inStock: true, rating: 4.4, numReviews: 2341,
    especificaciones: ['5 piezas', 'Titanio antiadherente', 'Aptas inducción', 'Tapas de vidrio'],
    envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Laptop Gamer Xtreme Pro RTX 4070',
    description: 'Laptop gaming de alta gama con Intel Core i9, RTX 4070 8GB, 32GB RAM DDR5, 1TB SSD NVMe.',
    mrp: 2499.99, price: 1999.99,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80','https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80'],
    category: 'Electrónicos', inStock: true, rating: 4.9, numReviews: 876,
    especificaciones: ['Intel Core i9', 'RTX 4070 8GB', '32GB DDR5', '1TB SSD NVMe', 'Pantalla QHD 165Hz'],
    destacado: true, envioGratis: true, garantia: '3 años',
  },
  {
    name: 'Perfume Elegance No. 5 - Eau de Parfum',
    description: 'Fragancia premium con notas de vainilla de Madagascar, jazmín de Grasse y sándalo de Mysore.',
    mrp: 129.99, price: 89.99,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80','https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80'],
    category: 'Salud', inStock: true, rating: 4.7, numReviews: 4321,
    especificaciones: ['Eau de Parfum', 'Duración 12h', 'Notas amaderadas', 'Hecho en Francia'],
    destacado: true,
  },
  {
    name: 'Cámara DSLR Profesional 4K + Lente 18-55mm',
    description: 'Cámara réflex digital profesional con sensor de 24.2MP, grabación de video 4K.',
    mrp: 899.99, price: 749.99,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'],
    category: 'Electrónicos', inStock: true, rating: 4.8, numReviews: 654,
    especificaciones: ['24.2MP Sensor', 'Video 4K 60fps', 'Pantalla articulada', 'Lente 18-55mm incluido'],
    envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Set Completo de Yoga - Mat + Bloques + Correa',
    description: 'Kit completo de yoga con mat antideslizante de 6mm, 2 bloques EVA y correa ajustable.',
    mrp: 79.99, price: 49.99,
    images: ['https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'],
    category: 'Deportes', inStock: true, rating: 4.5, numReviews: 1234,
    especificaciones: ['Mat 6mm antideslizante', '2 bloques EVA', 'Correa ajustable', 'Bolsa incluida'],
  },
  {
    name: 'Teclado Mecánico RGB - Switches Cherry MX',
    description: 'Teclado mecánico gaming con switches Cherry MX Red, retroiluminación RGB por tecla.',
    mrp: 179.99, price: 139.99,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80','https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80'],
    category: 'Electrónicos', inStock: true, rating: 4.7, numReviews: 1654,
    especificaciones: ['Cherry MX Red', 'RGB por tecla', 'Aluminio', 'USB-C desmontable'],
    destacado: true, envioGratis: true,
  },
  {
    name: 'Kit Robótica Educativa STEM - 200+ Piezas',
    description: 'Kit de robótica educativa con más de 200 piezas para construir 5 robots diferentes.',
    mrp: 69.99, price: 49.99,
    images: ['https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80','https://images.unsplash.com/photo-1560375121-5f7e3b90623f?w=600&q=80'],
    category: 'Juguetes', inStock: true, rating: 4.6, numReviews: 876,
    especificaciones: ['200+ piezas', '5 robots', 'App programable', 'Sensor ultrasonido'],
    destacado: true,
  },
];

function descargarImagen(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close(); fs.unlink(destPath, () => {});
        return descargarImagen(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close(); fs.unlink(destPath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`)); return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        if (fs.statSync(destPath).size > 1000) resolve(destPath);
        else { fs.unlink(destPath, () => {}); reject(new Error('Muy pequeño')); }
      });
    }).on('error', (err) => { file.close(); fs.unlink(destPath, () => {}); reject(err); });
  });
}

function crearPlaceholder() {
  const dir = path.join(UPLOADS_DIR, 'placeholders');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'imagen-no-disponible.svg');
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f3f4f6"/><g transform="translate(200,200)"><rect x="-40" y="-30" width="80" height="60" rx="8" fill="#d1d5db"/><circle cx="0" cy="0" r="15" fill="#9ca3af"/><path d="M-20 20 L0 5 L20 20" stroke="#9ca3af" fill="none" stroke-width="3"/></g><text x="200" y="260" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Imagen no disponible</text></svg>`);
  }
}

export async function inicializarBaseDeDatos() {
  console.log('\n' + '='.repeat(60));
  console.log('  🚀 ShopMax - Inicialización automática');
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopmax';

  try {
    // 1. Verificar si ya hay datos
    const colecciones = await mongoose.connection.db.listCollections().toArray();
    const nombresColecciones = colecciones.map(c => c.name);
    
    if (nombresColecciones.includes('products') && nombresColecciones.includes('users')) {
      const Producto = mongoose.model('Producto', new mongoose.Schema({}, { strict: false }), 'products');
      const Usuario = mongoose.model('Usuario', new mongoose.Schema({}, { strict: false }), 'users');
      const countP = await Producto.countDocuments();
      const countU = await Usuario.countDocuments();
      
      if (countP > 0 && countU > 0) {
        console.log(`📊 Base de datos ya inicializada:`);
        console.log(`   • ${countP} productos`);
        console.log(`   • ${countU} usuarios`);
        console.log(`\n✅ Todo listo! No se requiere inicialización.\n`);
        return { inicializado: false };
      }
    }

    // 2. Descargar imágenes
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(PRODUCTOS_DIR)) fs.mkdirSync(PRODUCTOS_DIR, { recursive: true });
    crearPlaceholder();

    console.log('📥 Descargando imágenes de productos...\n');
    const mapaImagenes = [];

    for (let i = 0; i < PRODUCTOS.length; i++) {
      const p = PRODUCTOS[i];
      const carpeta = p.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').substring(0, 30).replace(/-$/, '');
      const dir = path.join(PRODUCTOS_DIR, carpeta);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const imagenes = [];
      process.stdout.write(`   ${i+1}/${PRODUCTOS.length} ${p.name.substring(0,40)}... `);

      for (let j = 0; j < p.images.length; j++) {
        const ext = p.images[j].match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
        const archivo = `imagen-${j+1}.${ext}`;
        const ruta = path.join(dir, archivo);
        const rutaRel = `/uploads/productos/${carpeta}/${archivo}`;

        if (fs.existsSync(ruta) && fs.statSync(ruta).size > 1000) {
          imagenes.push(rutaRel); continue;
        }
        try { await descargarImagen(p.images[j], ruta); imagenes.push(rutaRel); }
        catch { imagenes.push(rutaRel); }
      }
      mapaImagenes.push({ carpeta, imagenes });
      process.stdout.write(`✅ (${imagenes.length} img)\n`);
    }
    fs.writeFileSync(MAPA_PATH, JSON.stringify(mapaImagenes, null, 2));

    // 3. Crear usuarios
    console.log('\n👤 Creando usuarios...');
    const { default: UsuarioModel } = await import('../modelos/Usuario.js');
    const admin = await UsuarioModel.create({ name: 'Admin ShopMax', email: 'admin@shopmax.com', password: 'admin123', isAdmin: true });
    await UsuarioModel.create({ name: 'Cliente Prueba', email: 'cliente@test.com', password: 'test123' });
    console.log(`   ✅ Admin: admin@shopmax.com / admin123`);
    console.log(`   ✅ Cliente: cliente@test.com / test123`);

    // 4. Insertar productos
    console.log('\n📦 Insertando productos...');
    const { default: ProductoModel } = await import('../modelos/Producto.js');
    const creados = await ProductoModel.insertMany(
      PRODUCTOS.map((p, i) => ({ ...p, images: mapaImagenes[i]?.imagenes || [], storeId: admin._id }))
    );
    console.log(`   ✅ ${creados.length} productos insertados`);

    // 5. Resumen
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('  ✅ INICIALIZACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`  ⏱️  ${elapsed}s | 📦 ${creados.length} productos | 👥 2 usuarios`);
    console.log(`  📸 ${mapaImagenes.reduce((s,m) => s+m.imagenes.length, 0)} imágenes`);
    console.log('');
    console.log('  🔑  Admin: admin@shopmax.com / admin123');
    console.log('  🔑  Cliente: cliente@test.com / test123');
    console.log('='.repeat(60) + '\n');

    return { inicializado: true };
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('💡 Asegúrate de que MongoDB esté corriendo en localhost:27017\n');
    throw error;
  }
}

if (process.argv[1] === __filename) {
  import('../configuracion/db.js').then(m => m.default()).then(() => inicializarBaseDeDatos()).then(() => process.exit(0)).catch(() => process.exit(1));
}