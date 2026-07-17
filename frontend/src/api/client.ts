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
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// API de Autenticación
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// API de Órdenes
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  getMyOrders: () => api.get('/orders/mine'),
};

// API de Subida de imágenes
export const uploadAPI = {
  uploadImage: (file: File, productId?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (productId) formData.append('productId', productId);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files: File[], productId?: string) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    if (productId) formData.append('productId', productId);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProductImages: (productId: string) => api.get(`/upload/${productId}`),
};

// API de Pagos Stripe
export const paymentAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string }) =>
    api.post('/payments/create-intent', data),
  confirmPayment: (paymentIntentId: string) =>
    api.post('/payments/confirm', { paymentIntentId }),
};

export default api;