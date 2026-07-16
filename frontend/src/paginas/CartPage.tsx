import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);

  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.07;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">¡Agrega productos para empezar a comprar!</p>
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart size={28} className="text-blue-600" />
          Carrito de Compras
          <span className="text-base font-normal text-gray-500">({items.length} productos)</span>
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
        >
          <Trash2 size={16} />
          Vaciar carrito
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de productos */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl p-4 flex gap-4 shadow-card border border-gray-100 animate-slideUp">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/producto/${item.productId}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-lg font-bold text-blue-600 mt-1">${item.price.toFixed(2)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      className="p-2 hover:bg-gray-50 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">Agrega ${(50 - total).toFixed(2)} más para envío gratis</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos (7%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition text-center shadow-lg shadow-blue-200"
            >
              Proceder al Pago
            </Link>

            <Link to="/tienda" className="block text-center mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;