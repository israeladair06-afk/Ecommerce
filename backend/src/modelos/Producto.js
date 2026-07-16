import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
  },
  mrp: {
    type: Number,
    required: [true, 'El precio MRP es requerido'],
  },
  price: {
    type: Number,
    required: [true, 'El precio de venta es requerido'],
  },
  images: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);