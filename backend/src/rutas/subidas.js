import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { proteger, admin } from '../intermediarios/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
const productosDir = path.join(uploadDir, 'productos');

// Asegurar directorios
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });

// Storage: guarda imágenes en /uploads/productos/ con ID único
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear subcarpeta por producto si se envía productId
    const productId = req.body.productId || 'temp';
    const destDir = path.join(productosDir, productId);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // ID único: img_<timestamp>_<random6>
    const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${id}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes (jpg, png, gif, webp, svg)'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const router = express.Router();

// POST /api/upload - Subir imagen (admin)
router.post('/', proteger, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const id = path.basename(req.file.filename, ext);
    const rutaRelativa = `/uploads/productos/${req.body.productId || 'temp'}/${req.file.filename}`;
    const urlCompleta = `http://localhost:${process.env.PORT || 5000}${rutaRelativa}`;

    res.json({
      success: true,
      data: {
        id,                    // ID único: img_1712345678_a1b2c3
        url: rutaRelativa,     // Ruta relativa: /uploads/productos/xxx/imagen.jpg
        urlCompleta,           // URL completa para usar directo
        filename: req.file.filename,
        productId: req.body.productId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload/multiple - Subir múltiples imágenes
router.post('/multiple', proteger, admin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se subieron archivos' });
    }

    const imagenes = req.files.map(file => {
      const ext = path.extname(file.originalname).toLowerCase();
      const id = path.basename(file.filename, ext);
      const rutaRelativa = `/uploads/productos/${req.body.productId || 'temp'}/${file.filename}`;
      return {
        id,
        url: rutaRelativa,
        filename: file.filename,
      };
    });

    res.json({ success: true, data: { imagenes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/upload/:productId - Listar imágenes de un producto
router.get('/:productId', proteger, admin, (req, res) => {
  try {
    const dir = path.join(productosDir, req.params.productId);
    if (!fs.existsSync(dir)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
    const imagenes = files.map(filename => {
      const ext = path.extname(filename);
      const id = path.basename(filename, ext);
      return {
        id,
        url: `/uploads/productos/${req.params.productId}/${filename}`,
        filename,
      };
    });
    res.json({ success: true, data: imagenes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export { upload };
export default router;