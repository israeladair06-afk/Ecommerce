import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Plus, Edit3, Trash2, Search, X, ChevronRight, Star,
  ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, Check,
  Save, Upload, Image as ImageIcon, Copy, Link as LinkIcon, Loader2
} from 'lucide-react';
import { useAppSelector } from '../lib/hooks';
import { todosLosProductos, categorias } from '../datos/productos';
import { uploadAPI, productsAPI } from '../api/client';
import type { Product } from '../tipos';

const AdminPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>(todosLosProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'productos' | 'galeria' | 'pedidos'>('productos');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  // Galería de imágenes subidas (desde backend)
  const [imagenesSubidas, setImagenesSubidas] = useState<Array<{id: string; url: string; filename: string}>>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', mrp: 0, price: 0,
    category: 'Electrónicos', inStock: true, images: [''] as string[],
    especificaciones: [''] as string[], destacado: false, envioGratis: false, garantia: '',
  });

  useEffect(() => {
    if (!user || !user.isAdmin) navigate('/login');
  }, [user, navigate]);

  // Cargar imágenes desde el backend
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await uploadAPI.getProductImages('temp');
      if (response.data?.success) {
        setImagenesSubidas(response.data.data);
      }
    } catch {
      // Backend no disponible, usar localStorage como fallback
      const localImgs = JSON.parse(localStorage.getItem('shopmax_imagenes_backend') || '[]');
      setImagenesSubidas(localImgs);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', mrp: 0, price: 0,
      category: 'Electrónicos', inStock: true, images: [''],
      especificaciones: [''], destacado: false, envioGratis: false, garantia: '',
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      images: product.images.length > 0 ? product.images : [''],
      especificaciones: product.especificaciones && product.especificaciones.length > 0
        ? product.especificaciones : [''],
      destacado: product.destacado || false,
      envioGratis: product.envioGratis || false,
      garantia: product.garantia || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      alert('Completa todos los campos requeridos');
      return;
    }

    const productData = {
      ...formData,
      images: formData.images.filter(img => img !== ''),
      especificaciones: formData.especificaciones.filter(e => e !== ''),
      mrp: formData.mrp || formData.price,
    };

    try {
      if (editingProduct) {
        // Actualizar en backend
        await productsAPI.update(editingProduct._id, productData);
        setProducts(prev => prev.map(p =>
          p._id === editingProduct._id ? { ...p, ...productData } : p
        ));
        showSuccess('✅ Producto actualizado en la base de datos');
      } else {
        // Crear en backend
        const response = await productsAPI.create(productData);
        if (response.data?.success) {
          setProducts(prev => [response.data.data, ...prev]);
        } else {
          // Fallback local
          const newProduct: Product = {
            _id: String(Date.now()), ...productData,
            rating: 0, numReviews: 0, storeId: '1',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          };
          setProducts(prev => [newProduct, ...prev]);
        }
        showSuccess('✅ Producto creado correctamente');
      }
    } catch {
      // Fallback local si backend no está disponible
      if (editingProduct) {
        setProducts(prev => prev.map(p =>
          p._id === editingProduct._id ? { ...p, ...productData } : p
        ));
      } else {
        const newProduct: Product = {
          _id: String(Date.now()), ...productData,
          rating: 0, numReviews: 0, storeId: '1',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setProducts(prev => [newProduct, ...prev]);
      }
      showSuccess(editingProduct ? '✅ Producto actualizado (local)' : '✅ Producto creado (local)');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.delete(id);
    } catch {}
    setProducts(prev => prev.filter(p => p._id !== id));
    setShowDeleteConfirm(null);
    showSuccess('🗑️ Producto eliminado');
  };

  /// ============================================
  /// SUBIR IMAGEN AL BACKEND
  /// ============================================
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('La imagen no puede superar los 10MB'); return; }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.data?.success) {
        const { id, url } = response.data.data;
        setImagenesSubidas(prev => [{ id, url, filename: file.name }, ...prev]);
        showSuccess(`✅ Imagen subida - ID: ${id}`);
      }
    } catch {
      // Fallback: guardar en localStorage como base64
      const reader = new FileReader();
      reader.onload = () => {
        const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const img = { id, url: reader.result as string, filename: file.name };
        setImagenesSubidas(prev => [img, ...prev]);
        const saved = JSON.parse(localStorage.getItem('shopmax_imagenes_backend') || '[]');
        saved.push(img);
        localStorage.setItem('shopmax_imagenes_backend', JSON.stringify(saved));
        showSuccess(`✅ Imagen guardada localmente - ID: ${id}`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUseImageInForm = (url: string) => {
    const images = [...formData.images];
    const emptyIndex = images.findIndex(img => img === '');
    if (emptyIndex >= 0) images[emptyIndex] = url;
    else images.push(url);
    setFormData(prev => ({ ...prev, images }));
    showSuccess('✅ Imagen agregada al producto');
  };

  const handleCopyImageId = (url: string) => {
    navigator.clipboard.writeText(url);
    showSuccess('📋 URL copiada: ' + url.substring(0, 40) + '...');
  };

  

  const addImageField = () => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImageField = (index: number) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  const addSpecField = () => setFormData(prev => ({ ...prev, especificaciones: [...prev.especificaciones, ''] }));
  const removeSpecField = (index: number) => setFormData(prev => ({ ...prev, especificaciones: prev.especificaciones.filter((_, i) => i !== index) }));

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    avgPrice: (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2),
    outOfStock: products.filter(p => !p.inStock).length,
    totalImages: imagenesSubidas.length,
  };

  if (!user || !user.isAdmin) return null;

  const getImagePreview = (url: string): string => {
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    if (url.startsWith('img_')) return `http://localhost:5000/uploads/productos/temp/${url}.jpg`;
    return url;
  };

  const isLocalUrl = (url: string) => url.startsWith('data:') || url.startsWith('http');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <ShoppingCart size={28} className="text-blue-400" />
                Panel de Administración
              </h1>
              <p className="text-gray-400 mt-1">Gestiona tu tienda ShopMax</p>
            </div>
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
              Ver tienda <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Package} value={stats.totalProducts} label="Productos" color="blue" />
          <StatCard icon={DollarSign} value={`$${stats.totalValue.toFixed(0)}`} label="Valor total" color="green" />
          <StatCard icon={TrendingUp} value={`$${stats.avgPrice}`} label="Precio prom." color="purple" />
          <StatCard icon={AlertCircle} value={stats.outOfStock} label="Agotados" color="red" />
          <StatCard icon={ImageIcon} value={stats.totalImages} label="Imágenes" color="amber" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: 'productos', label: 'Productos', icon: Package },
              { id: 'galeria', label: 'Galería de Imágenes', icon: ImageIcon },
              { id: 'pedidos', label: 'Pedidos', icon: Users },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition border-b-2 shrink-0 ${
                  activeTab === tab.id ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'productos' && (
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={openCreateModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-200 w-full sm:w-auto justify-center">
                  <Plus size={16} /> Nuevo Producto
                </button>
              </div>

              {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-slideDown">
                  <Check size={16} /> {successMsg}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 font-semibold text-gray-600">Producto</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-600 hidden md:table-cell">Categoría</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Precio</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 hidden sm:table-cell">Stock</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-600 hidden lg:table-cell">Rating</th>
                      <th className="text-right py-3 px-2 font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              <img src={getImagePreview(product.images[0]) || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-400">ID: {product._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{product.category}</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                          {product.mrp > product.price && <span className="text-xs text-gray-400 line-through ml-1">${product.mrp.toFixed(2)}</span>}
                        </td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">
                          {product.inStock ? <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">En stock</span> : <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">Agotado</span>}
                        </td>
                        <td className="py-3 px-2 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{product.rating}</span></div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><Edit3 size={16} /></button>
                            {showDeleteConfirm === product._id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(product._id)} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition">Confirmar</button>
                                <button onClick={() => setShowDeleteConfirm(null)} className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition">Cancelar</button>
                              </div>
                            ) : (
                              <button onClick={() => setShowDeleteConfirm(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 size={16} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12"><Package size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No se encontraron productos</p></div>
              )}
            </div>
          )}

          {/* TAB: Galería de imágenes */}
          {activeTab === 'galeria' && (
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Galería de imágenes</h3>
                  <p className="text-sm text-gray-500">Sube imágenes y asígnalas a productos usando su URL</p>
                </div>
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleUploadImage} accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-200">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploading ? 'Subiendo...' : 'Subir imagen'}
                  </button>
                </div>
              </div>

              {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-slideDown">
                  <Check size={16} /> {successMsg}
                </div>
              )}

              {imagenesSubidas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay imágenes subidas</h3>
                  <p className="text-gray-500 text-sm mb-6">Sube imágenes y asígnalas a productos usando la URL generada</p>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    <Upload size={18} /> Subir primera imagen
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagenesSubidas.map((img) => (
                    <div key={img.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition group">
                      <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        <img src={getImagePreview(img.url)} alt={img.filename} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button onClick={() => handleUseImageInForm(img.url)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-50 transition" title="Usar en producto"><Plus size={14} className="text-blue-600" /></button>
                          <button onClick={() => handleCopyImageId(img.url)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-green-50 transition" title="Copiar URL"><Copy size={14} className="text-green-600" /></button>
                        </div>
                      </div>
                      <div className="p-2">
                        <code className="text-[9px] font-mono bg-gray-100 px-1 py-0.5 rounded text-blue-600 block truncate">{img.id}</code>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{img.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 bg-blue-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-blue-600" /> ¿Cómo funciona?
                </h4>
                <ol className="text-sm text-gray-600 space-y-1.5 ml-5 list-decimal">
                  <li>Sube una imagen desde tu computadora ⬆️</li>
                  <li>Se guarda en <code className="bg-blue-100 px-1 rounded">backend/uploads/productos/</code> con un <strong>ID único</strong></li>
                  <li>La URL generada es: <code className="bg-blue-100 px-1 rounded">/uploads/productos/temp/img_xxx.jpg</code></li>
                  <li>Copia la URL y pégala en el campo "Imágenes" del producto</li>
                  <li>El producto mostrará esa imagen al cargarse 🖼️</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="p-6 text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Gestión de pedidos próximamente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ej: Auriculares Bluetooth Pro Max" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Descripción detallada..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0.00" step="0.01" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio original (MRP)</label>
                  <input type="number" value={formData.mrp} onChange={(e) => setFormData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0.00" step="0.01" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {categorias.filter(c => c.id !== 'todas').map(cat => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Garantía</label>
                  <input type="text" value={formData.garantia} onChange={(e) => setFormData(prev => ({ ...prev, garantia: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ej: 1 año" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">En stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.destacado} onChange={(e) => setFormData(prev => ({ ...prev, destacado: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Destacado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.envioGratis} onChange={(e) => setFormData(prev => ({ ...prev, envioGratis: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">Envío gratis</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Imágenes (URL o ruta)</label>
                  <button onClick={addImageField} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Campo</button>
                </div>
                {formData.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" value={img}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[i] = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-xs"
                      placeholder="/uploads/productos/... o https://..." />
                    {img && isLocalUrl(img) && (
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
                        <img src={getImagePreview(img)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    {formData.images.length > 1 && (
                      <button onClick={() => removeImageField(i)} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Especificaciones</label>
                  <button onClick={addSpecField} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Agregar</button>
                </div>
                {formData.especificaciones.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" value={spec}
                      onChange={(e) => {
                        const newSpecs = [...formData.especificaciones];
                        newSpecs[i] = e.target.value;
                        setFormData(prev => ({ ...prev, especificaciones: newSpecs }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ej: 30h de batería" />
                    {formData.especificaciones.length > 1 && <button onClick={() => removeSpecField(i)} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200">
                <Save size={16} /> {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-12" />
    </div>
  );
};

// Componente StatCard
const StatCard = ({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;