import express from 'express';
import Pedido from '../modelos/Pedido.js';
import { proteger } from '../intermediarios/auth.js';

const router = express.Router();

// POST /api/orders - Crear orden
router.post('/', proteger, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay productos en la orden' });
    }
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 9.99;
    const tax = subtotal * 0.07;
    const total = subtotal + shipping + tax;
    const order = await Pedido.create({ user: req.user._id, items, shippingAddress, paymentMethod, subtotal, shipping, tax, total });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/orders/mine
router.get('/mine', proteger, async (req, res) => {
  try {
    const orders = await Pedido.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders
router.get('/', proteger, async (req, res) => {
  try {
    const orders = await Pedido.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', proteger, async (req, res) => {
  try {
    const order = await Pedido.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/pay
router.put('/:id/pay', proteger, async (req, res) => {
  try {
    const order = await Pedido.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = { id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.email_address };
    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', proteger, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Pedido.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;