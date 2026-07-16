import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Usuario from './modelos/Usuario.js';
import Producto from './modelos/Producto.js';
import Pedido from './modelos/Pedido.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar mapa de imágenes locales
let mapaImagenes = [];
const mapaPath = path.join(__dirname, '../uploads/mapa-imagenes.json');
if (fs.existsSync(mapaPath)) {
  mapaImagenes = JSON.parse(fs.readFileSync(mapaPath, 'utf-8'));
  console.log(`📸 Cargadas ${mapaImagenes.length} referencias de imágenes locales`);
}

const placeholder = '/uploads/placeholders/imagen-no-disponible.svg';

const products = [
  {
    name: 'Auriculares Bluetooth Pro Max - Cancelación de Ruido',
    description: 'Auriculares inalámbricos premium con cancelación de ruido activa ANC. Batería de 30 horas, sonido envolvente 3D.',
    mrp: 299.99, price: 199.99,
    images: mapaImagenes[0]?.imagenes || [placeholder, placeholder, placeholder],
    category: 'Electrónicos', inStock: true, rating: 4.8, numReviews: 2453,
    especificaciones: ['Cancelación de ruido activa', '30h de batería', 'Bluetooth 5.3', 'Almohadillas memory foam'],
    destacado: true, envioGratis: true, garantia: '1 año',
  },
  {
    name: 'Zapatillas Deportivas Ultra Boost - Running',
    description: 'Zapatillas de running con tecnología de amortiguación avanzada. Suela de caucho resistente.',
    mrp: 159.99, price: 119.99,
    images: mapaImagenes[1]?.imagenes || [placeholder, placeholder],
    category: 'Deportes', inStock: true, rating: 4.7, numReviews: 1832,
    especificaciones: ['Amortiguación Ultra Boost', 'Malla transpirable', 'Suela antideslizante', 'Peso ligero 250g'],
    destacado: true, envioGratis: true,
  },
  {
    name: 'Reloj Inteligente Series 5 - GPS + Salud',
    description: 'Smartwatch premium con monitor de frecuencia cardíaca, GPS integrado, pantalla AMOLED siempre activa.',
    mrp: 449.99, price: 349.99,
    images: mapaImagenes[2]?.imagenes || [placeholder, placeholder],
    category: 'Electrónicos', inStock: true, rating: 4.9, numReviews: 3201,
    especificaciones: ['Pantalla AMOLED 1.5"', 'GPS integrado', 'Monitor cardíaco', 'Resistente 5ATM', 'Batería 7 días'],
    destacado: true, envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Chaqueta de Cuero Premium - Hombre',
    description: 'Chaqueta de cuero genuino 100% con diseño clásico motoquero. Forro interior de poliéster.',
    mrp: 299.99, price: 249.99,
    images: mapaImagenes[3]?.imagenes || [placeholder, placeholder],
    category: 'Ropa', inStock: true, rating: 4.6, numReviews: 987,
    especificaciones: ['Cuero genuino 100%', 'Cremallera YKK', 'Forro interior', 'Bolsillos con cierre'],
    destacado: true,
  },
  {
    name: 'Mochila Viajera 40L - Impermeable USB',
    description: 'Mochila viajera espaciosa con compartimento para laptop de 15.6", puerto de carga USB externo.',
    mrp: 89.99, price: 59.99,
    images: mapaImagenes[4]?.imagenes || [placeholder, placeholder],
    category: 'Hogar', inStock: true, rating: 4.5, numReviews: 1543,
    especificaciones: ['Capacidad 40L', 'Puerto USB', 'Impermeable', 'Compartimento laptop 15.6"'],
    envioGratis: true,
  },
  {
    name: 'Set de Sartenes Antiadherentes - 5 Piezas',
    description: 'Juego de 5 sartenes profesionales con recubrimiento de titanio antiadherente.',
    mrp: 199.99, price: 149.99,
    images: mapaImagenes[5]?.imagenes || [placeholder, placeholder],
    category: 'Hogar', inStock: true, rating: 4.4, numReviews: 2341,
    especificaciones: ['5 piezas', 'Titanio antiadherente', 'Aptas inducción', 'Tapas de vidrio'],
    envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Laptop Gamer Xtreme Pro RTX 4070',
    description: 'Laptop gaming de alta gama con Intel Core i9, RTX 4070 8GB, 32GB RAM DDR5, 1TB SSD NVMe.',
    mrp: 2499.99, price: 1999.99,
    images: mapaImagenes[6]?.imagenes || [placeholder, placeholder],
    category: 'Electrónicos', inStock: true, rating: 4.9, numReviews: 876,
    especificaciones: ['Intel Core i9', 'RTX 4070 8GB', '32GB DDR5', '1TB SSD NVMe', 'Pantalla QHD 165Hz'],
    destacado: true, envioGratis: true, garantia: '3 años',
  },
  {
    name: 'Perfume Elegance No. 5 - Eau de Parfum',
    description: 'Fragancia premium con notas de vainilla de Madagascar, jazmín de Grasse y sándalo de Mysore.',
    mrp: 129.99, price: 89.99,
    images: mapaImagenes[7]?.imagenes || [placeholder, placeholder],
    category: 'Salud', inStock: true, rating: 4.7, numReviews: 4321,
    especificaciones: ['Eau de Parfum', 'Duración 12h', 'Notas amaderadas', 'Hecho en Francia'],
    destacado: true,
  },
  {
    name: 'Cámara DSLR Profesional 4K + Lente 18-55mm',
    description: 'Cámara réflex digital profesional con sensor de 24.2MP, grabación de video 4K.',
    mrp: 899.99, price: 749.99,
    images: mapaImagenes[8]?.imagenes || [placeholder, placeholder],
    category: 'Electrónicos', inStock: true, rating: 4.8, numReviews: 654,
    especificaciones: ['24.2MP Sensor', 'Video 4K 60fps', 'Pantalla articulada', 'Lente 18-55mm incluido'],
    envioGratis: true, garantia: '2 años',
  },
  {
    name: 'Set Completo de Yoga - Mat + Bloques + Correa',
    description: 'Kit completo de yoga con mat antideslizante de 6mm, 2 bloques EVA y correa ajustable.',
    mrp: 79.99, price: 49.99,
    images: mapaImagenes[9]?.imagenes || [placeholder, placeholder],
    category: 'Deportes', inStock: true, rating: 4.5, numReviews: 1234,
    especificaciones: ['Mat 6mm antideslizante', '2 bloques EVA', 'Correa ajustable', 'Bolsa incluida'],
  },
  {
    name: 'Teclado Mecánico RGB - Switches Cherry MX',
    description: 'Teclado mecánico gaming con switches Cherry MX Red, retroiluminación RGB por tecla.',
    mrp: 179.99, price: 139.99,
    images: mapaImagenes[10]?.imagenes || [placeholder, placeholder],
    category: 'Electrónicos', inStock: true, rating: 4.7, numReviews: 1654,
    especificaciones: ['Cherry MX Red', 'RGB por tecla', 'Aluminio', 'USB-C desmontable'],
    destacado: true, envioGratis: true,
  },
  {
    name: 'Kit Robótica Educativa STEM - 200+ Piezas',
    description: 'Kit de robótica educativa con más de 200 piezas para construir 5 robots diferentes.',
    mrp: 69.99, price: 49.99,
    images: mapaImagenes[11]?.imagenes || [placeholder, placeholder],
    category: 'Juguetes', inStock: true, rating: 4.6, numReviews: 876,
    especificaciones: ['200+ piezas', '5 robots', 'App programable', 'Sensor ultrasonido'],
    destacado: true,
  },
];

async function seed() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopmax');
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Limpiando datos anteriores...');
    await Producto.deleteMany({});
    await Usuario.deleteMany({});
    await Pedido.deleteMany({});

    console.log('👤 Creando usuario administrador...');
    const adminUser = await Usuario.create({
      name: 'Admin ShopMax',
      email: 'admin@shopmax.com',
      password: 'admin123',
      isAdmin: true,
    });
    console.log(`   Admin creado: admin@shopmax.com / admin123`);

    const testUser = await Usuario.create({
      name: 'Cliente Prueba',
      email: 'cliente@test.com',
      password: 'test123',
    });
    console.log(`   Usuario prueba: cliente@test.com / test123`);

    console.log('📦 Insertando productos con imágenes locales...');
    const createdProducts = await Producto.insertMany(
      products.map(p => ({ ...p, storeId: adminUser._id }))
    );
    console.log(`   ${createdProducts.length} productos insertados`);

    console.log('\n📸 Resumen de imágenes:');
    createdProducts.forEach((p, i) => {
      const localCount = p.images.filter(img => img.startsWith('/uploads/productos/')).length;
      console.log(`   ${i + 1}. ${p.name.slice(0, 40)}... - ${p.images.length} img (${localCount} locales)`);
    });

    console.log('\n✅ Seed completado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin: admin@shopmax.com');
    console.log('🔑 Pass: admin123');
    console.log('📧 Cliente: cliente@test.com');
    console.log('🔑 Pass: test123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();