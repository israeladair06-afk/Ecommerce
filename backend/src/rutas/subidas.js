import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { proteger, admin } from '../intermediarios/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  cb(extname && mimetype ? null : new Error('Solo imágenes (jpg, png, gif, webp, svg)'), extname && mimetype);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.post('/', proteger, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    res.json({ success: true, data: { url: `/uploads/${req.file.filename}`, filename: req.file.filename } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/multiple', proteger, admin, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No se subieron archivos' });
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, data: { urls, files: req.files.map(f => f.filename) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export { upload };
export default router;