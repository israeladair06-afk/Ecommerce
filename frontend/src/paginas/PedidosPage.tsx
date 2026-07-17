import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Clock, CheckCircle, Truck, XCircle, Eye, ShoppingBag, ArrowLeft, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useAppSelector } from '../lib/hooks';
import { todosLosProductos } from '../datos/productos';

interface PedidoItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Pedido {
  id: string;
  fecha: string;
  items: PedidoItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  direccion: string;
  metodoPago: string;
  ultimos4?: string;
}

const estadosPedido = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PedidosPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos guardados en localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('pedidos');
      if (saved) {
        setPedidos(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error cargando pedidos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredPedidos = pedidos.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProductImage = (productId: string): string => {
    const product = todosLosProductos.find(p => p._id === productId);
    if (product?.images[0]) {
      if (product.images[0].includes('unsplash.com')) return product.images[0];
      if (product.images[0].startsWith('/uploads/')) return `http://localhost:5000${product.images[0]}`;
      return product.images[0];
    }
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PA', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para ver tus pedidos</h2>
          <p className="text-gray-500 mb-8">Necesitas iniciar sesión para ver el historial de tus compras.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (selectedPedido) {
    const estado = estadosPedido[selectedPedido.estado];
    const EstadoIcon = estado.icon;
    const pasos = [
      { key: 'pendiente', label: 'Pedido realizado', icon: ShoppingBag, fecha: selectedPedido.fecha },
      { key: 'confirmado', label: 'Confirmado', icon: CheckCircle, fecha: selectedPedido.estado !== 'pendiente' ? selectedPedido.fecha : undefined },
      { key: 'enviado', label: 'Enviado', icon: Truck, fecha: selectedPedido.estado === 'enviado' || selectedPedido.estado === 'entregado' ? selectedPedido.fecha : undefined },
      { key: 'entregado', label: 'Entregado', icon: CheckCircle, fecha: selectedPedido.estado === 'entregado' ? selectedPedido.fecha : undefined },
    ];

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedPedido(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition mb-6">
          <ArrowLeft size={16} /> Volver a mis pedidos
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pedido {selectedPedido.id}</h1>
              <p className="text-sm text-gray-500 mt-1">Realizado el {formatDate(selectedPedido.fecha)}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${estado.color}`}>
              <EstadoIcon size={16} /> {estado.label}
            </span>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {pasos.map((paso, i) => {
                const activo = pasos.findIndex(p => p.key === selectedPedido.estado) >= i;
                const completado = pasos.findIndex(p => p.key === selectedPedido.estado) > i;
                return (
                  <div key={paso.key} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      completado ? 'bg-green-500 text-white' : activo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <paso.icon size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${activo ? 'text-gray-900' : 'text-gray-400'}`}>{paso.label}</p>
                      {paso.fecha && <p className="text-xs text-gray-500">{formatDate(paso.fecha)}</p>}
                    </div>
                    {i < pasos.length - 1 && <div className={`hidden sm:block flex-1 h-0.5 mt-5 ${completado ? 'bg-green-500' : activo ? 'bg-blue-300' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Productos</h3>
            {selectedPedido.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <img src={item.image || getProductImage(item.productId)} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/producto/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition line-clamp-1">{item.name}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
                <MapPin size={14} className="text-blue-600" /> Dirección de envío
              </h4>
              <p className="text-sm text-gray-600">{selectedPedido.direccion}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2">
                <CreditCard size={14} className="text-blue-600" /> Método de pago
              </h4>
              <p className="text-sm text-gray-600 capitalize">{selectedPedido.metodoPago}</p>
              {selectedPedido.ultimos4 && <p className="text-xs text-gray-500">Terminada en {selectedPedido.ultimos4}</p>}
            </div>
          </div>

          {/* Resumen de precios */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${selectedPedido.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Envío</span><span className={selectedPedido.shipping === 0 ? 'text-green-600 font-medium' : ''}>{selectedPedido.shipping === 0 ? 'GRATIS' : `$${selectedPedido.shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Impuestos</span><span>${selectedPedido.tax.toFixed(2)}</span></div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-blue-600">${selectedPedido.total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/tienda" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition text-center shadow-md shadow-blue-200">
              Comprar de nuevo
            </Link>
            <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              Solicitar devolución
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package size={28} className="text-blue-600" />
            Mis Pedidos
          </h1>
          <p className="text-gray-500 mt-1">{pedidos.length > 0 ? `Tienes ${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}` : 'Aún no has realizado ningún pedido'}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en pedidos..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 size={36} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando pedidos...</p>
        </div>
      ) : filteredPedidos.length > 0 ? (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => {
            const estado = estadosPedido[pedido.estado];
            const EstadoIcon = estado.icon;
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Pedido #{pedido.id}</p>
                      <p className="text-xs text-gray-500">{formatDate(pedido.fecha)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estado.color}`}>
                        <EstadoIcon size={12} /> {estado.label}
                      </span>
                      <span className="text-lg font-bold text-gray-900">${pedido.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {pedido.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        <img src={item.image || getProductImage(item.productId)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {pedido.items.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                        <span className="text-xs font-medium text-gray-500">+{pedido.items.length - 4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}</p>
                    <button
                      onClick={() => setSelectedPedido(pedido)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver detalle <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron pedidos' : 'Aún no has comprado nada'}
          </h2>
          <p className="text-gray-500 mb-8">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Explora nuestros productos y realiza tu primera compra'}
          </p>
          <Link to="/tienda" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
            <ArrowLeft size={20} /> Ir a la tienda
          </Link>
        </div>
      )}
    </div>
  );
};

export default PedidosPage;