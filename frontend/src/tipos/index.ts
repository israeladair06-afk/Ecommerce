// Tipos de Producto
export interface Product {
  _id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  rating: number;
  numReviews: number;
  storeId: string;
  especificaciones?: string[];
  destacado?: boolean;
  envioGratis?: boolean;
  garantia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCardProps {
  product: Product;
}

// Tipos de Usuario
export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  isAdmin: boolean;
  cart: CartItem[];
  createdAt: string;
}

// Tipos de Carrito
export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

// Tipos de Dirección
export interface Address {
  _id: string;
  userId: string;
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

// Tipos de Pedido
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export const OrderStatusValues = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  PROCESANDO: 'PROCESANDO',
  ENVIADO: 'ENVIADO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
} as const;

export type OrderStatus = (typeof OrderStatusValues)[keyof typeof OrderStatusValues];

export const PaymentMethodValues = {
  TARJETA: 'TARJETA',
  PAYPAL: 'PAYPAL',
  TRANSFERENCIA: 'TRANSFERENCIA',
} as const;

export type PaymentMethod = (typeof PaymentMethodValues)[keyof typeof PaymentMethodValues];

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: OrderStatus;
  userId: string;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de Reseña
export interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  userImage: string;
  productId: string;
  createdAt: string;
}

// Tipos de Cupón
export interface Coupon {
  code: string;
  description: string;
  discount: number;
  forNewUser: boolean;
  isPublic: boolean;
  expiresAt: string;
}

// Tipos de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  pages: number;
  total: number;
}

// Tipos para el estado de Redux Auth
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
}

// Tipos para Stripe
export interface StripePaymentIntent {
  clientSecret: string;
  amount: number;
}

// Tipos para Filtros
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
  page?: number;
}