import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Plus, Edit3, Trash2, Search, X, ChevronRight, Star,
  ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, Check,
  Save
} from 'lucide-react';
import { useAppSelector } from '../lib/hooks';
import { todosLosProductos, categorias } from '../datos/productos';
import type { Product } from '../tipos';

const AdminPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(todosLosProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'productos' | 'pedidos' | 'usuarios'>('productos');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', mrp: 0, price: 0,
    category: 'Electrónicos', inStock: true, images: [''],
    especificaciones: [''], destacado: false, envioGratis: false, garantia: '',
  });

  // Verificar si es admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

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

  const handleSave = () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      alert('Completa todos los campos requeridos');
      return;
    }

    if (editingProduct) {
      // Editar existente
      setProducts(prev => prev.map(p =>
        p._id === editingProduct._id
          ? {
              ...p,
              ...formData,
              images: formData.images.filter(img => img !== ''),
              especificaciones: formData.especificaciones.filter(e => e !== ''),
              mrp: formData.mrp || formData.price,
            }
          : p
      ));
      showSuccess('✅ Producto actualizado correctamente');
    } else {
      // Crear nuevo
      const newProduct: Product = {
        _id: String(Date.now()),
        ...formData,
        images: formData.images.filter(img => img !== ''),
        especificaciones: formData.especificaciones.filter(e => e !== ''),
        mrp: formData.mrp || formData.price,
        rating: 0,
        numReviews: 0,
        storeId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);
      showSuccess('✅ Producto creado correctamente');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p._id !== id));
    setShowDeleteConfirm(null);
    showSuccess('🗑️ Producto eliminado correctamente');
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSpecField = () => {
    setFormData(prev => ({ ...prev, especificaciones: [...prev.especificaciones, ''] }));
  };

  const removeSpecField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      especificaciones: prev.especificaciones.filter((_, i) => i !== index),
    }));
  };

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
    avgPrice: (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2),
    outOfStock: products.filter(p => !p.inStock).length,
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
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

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500">Productos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Valor total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.avgPrice}</p>
                <p className="text-xs text-gray-500">Precio promedio</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                <p className="text-xs text-gray-500">Agotados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'productos', label: 'Productos', icon: Package },
              { id: 'pedidos', label: 'Pedidos', icon: Users },
              { id: 'usuarios', label: 'Usuarios', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'productos' && (
            <div className="p-4 md:p-6">
              {/* Barra de acciones */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-200 w-full sm:w-auto justify-center"
                >
                  <Plus size={16} />
                  Nuevo Producto
                </button>
              </div>

              {/* Mensaje de éxito */}
              {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-slideDown">
                  <Check size={16} /> {successMsg}
                </div>
              )}

              {/* Tabla de productos */}
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
                              <img src={product.images[0] || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-400">ID: {product._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                          {product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through ml-1">${product.mrp.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">
                          {product.inStock ? (
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">En stock</span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">Agotado</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>
                            {showDeleteConfirm === product._id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowDeleteConfirm(product._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="p-6 text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Gestión de pedidos próximamente</p>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="p-6 text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Gestión de usuarios próximamente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ej: Auriculares Bluetooth Pro Max"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio original (MRP)</label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Categoría y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {categorias.filter(c => c.id !== 'todas').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Garantía</label>
                  <input
                    type="text"
                    value={formData.garantia}
                    onChange={(e) => setFormData(prev => ({ ...prev, garantia: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ej: 1 año"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">En stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => setFormData(prev => ({ ...prev, destacado: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Destacado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.envioGratis}
                    onChange={(e) => setFormData(prev => ({ ...prev, envioGratis: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Envío gratis</span>
                </label>
              </div>

              {/* Imágenes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Imágenes (URLs)</label>
                  <button onClick={addImageField} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Agregar</button>
                </div>
                {formData.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[i] = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button onClick={() => removeImageField(i)} className="p-2 text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Especificaciones */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Especificaciones</label>
                  <button onClick={addSpecField} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Agregar</button>
                </div>
                {formData.especificaciones.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => {
                        const newSpecs = [...formData.especificaciones];
                        newSpecs[i] = e.target.value;
                        setFormData(prev => ({ ...prev, especificaciones: newSpecs }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ej: 30h de batería"
                    />
                    {formData.especificaciones.length > 1 && (
                      <button onClick={() => removeSpecField(i)} className="p-2 text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-200"
              >
                <Save size={16} />
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
};

export default AdminPage;