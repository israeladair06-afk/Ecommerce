import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import conectarDB from './configuracion/db.js';
import { inicializarBaseDeDatos } from './datos/inicializar.js';

dotenv.config();

import rutasProductos from './rutas/productos.js';
import rutasAuth from './rutas/auth.js';
import rutasPedidos from './rutas/pedidos.js';
import rutasPagos from './rutas/pagos.js';
import rutasSubidas from './rutas/subidas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', rutasProductos);
app.use('/api/auth', rutasAuth);
app.use('/api/orders', rutasPedidos);
app.use('/api/payments', rutasPagos);
app.use('/api/upload', rutasSubidas);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const iniciarServidor = async () => {
  try {
    // 1. Conectar a MongoDB
    await conectarDB();

    // 2. Inicializar base de datos automáticamente
    //    - Si ya hay datos: solo muestra resumen
    //    - Si no hay datos: descarga imágenes y puebla la BD
    await inicializarBaseDeDatos();

    // 3. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📦 API: http://localhost:${PORT}/api`);
      console.log(`🖼️  Imágenes: http://localhost:${PORT}/uploads`);
      console.log(`🔥 Servidor listo para usar!\n`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;