import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de Productos
export const productsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  getFeatured: () => api.get('/products/featured'),
  search: (query: string) => api.get(`/products/search/${query}`),
  create: (data: FormData) =>
    api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// API de Autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// API de Órdenes
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  getMyOrders: () => api.get('/orders/mine'),
};

// API de Carrito
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data: { productId: string; quantity: number }) =>
    api.post('/cart', data),
  updateCartItem: (productId: string, quantity: number) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId: string) =>
    api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// API de Direcciones
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id: string) => api.get(`/addresses/${id}`),
  create: (data: any) => api.post('/addresses', data),
  update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

// API de Reseñas
export const reviewAPI = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: { productId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// API de Pagos Stripe
export const paymentAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string }) =>
    api.post('/payments/create-intent', data),
  confirmPayment: (paymentIntentId: string) =>
    api.post('/payments/confirm', { paymentIntentId }),
};

export default api;