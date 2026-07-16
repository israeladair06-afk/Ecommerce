import express from 'express';
import Usuario from '../modelos/Usuario.js';
import { generarToken, proteger } from '../intermediarios/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const user = await Usuario.create({ name, email, password });
    const token = generarToken(user._id);

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
    }

    const token = generarToken(user._id);
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/profile
router.get('/profile', proteger, async (req, res) => {
  try {
    const user = await Usuario.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', proteger, async (req, res) => {
  try {
    const user = await Usuario.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) user.password = req.body.password;
      if (req.body.image) user.image = req.body.image;
      const updatedUser = await user.save();
      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;