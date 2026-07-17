import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { ordersAPI } from '../api/client';
import {
  CreditCard, Lock, Truck, ShieldCheck, ChevronRight, Check,
  MapPin, User, Phone, Mail, Building, Home, AlertCircle,
  Package, ShoppingBag, ArrowLeft, CheckCircle, Loader2,
  Wallet, Banknote, Smartphone, Copy, LogIn, UserPlus
} from 'lucide-react';

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.07;
  const grandTotal = total + shipping + tax;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'paypal' | 'transferencia'>('tarjeta');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Panamá',
  });

  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'number') formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
    else if (name === 'expiry') formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
    else if (name === 'cvc') formattedValue = value.replace(/\D/g, '').slice(0, 4);
    setCard(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.fullName.trim()) newErrors.fullName = 'El nombre es obligatorio';
    if (!address.email.trim()) newErrors.email = 'El email es obligatorio';
    if (!address.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!address.street.trim()) newErrors.street = 'La dirección es obligatoria';
    if (!address.city.trim()) newErrors.city = 'La ciudad es obligatoria';
    if (!address.state.trim()) newErrors.state = 'El estado es obligatorio';
    if (!address.zip.trim()) newErrors.zip = 'El código postal es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    if (paymentMethod === 'tarjeta') {
      if (card.number.replace(/\s/g, '').length < 16) newErrors.number = 'Número de tarjeta inválido';
      if (!card.name.trim()) newErrors.name = 'Nombre del titular es obligatorio';
      if (card.expiry.length < 5) newErrors.expiry = 'Fecha de expiración inválida';
      if (card.cvc.length < 3) newErrors.cvc = 'CVC inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateAddress()) { setStep(2); window.scrollTo(0, 0); }
    else if (step === 2) { setStep(3); window.scrollTo(0, 0); }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'tarjeta' && !validateCard()) return;
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const fakeOrderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setOrderId(fakeOrderId);

    // Guardar pedido en localStorage
    const nuevoPedido = {
      id: fakeOrderId,
      fecha: new Date().toISOString(),
      items: items.map(item => ({
        productId: item.productId, name: item.name, image: item.image,
        quantity: item.quantity, price: item.price,
      })),
      total: grandTotal, subtotal: total, shipping, tax,
      estado: 'pendiente' as const,
      direccion: `${address.street}, ${address.city}, ${address.state} - ${address.zip}, ${address.country}`,
      metodoPago: paymentMethod === 'tarjeta' ? `Tarjeta terminada en ${card.number.slice(-4)}` : paymentMethod === 'paypal' ? 'PayPal' : 'Transferencia bancaria',
      ultimos4: paymentMethod === 'tarjeta' ? card.number.replace(/\s/g, '').slice(-4) : undefined,
    };

    const pedidosExistentes = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidosExistentes.unshift(nuevoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidosExistentes));

    // Guardar en MongoDB si backend disponible
    try {
      await ordersAPI.create({
        items: nuevoPedido.items,
        shippingAddress: {
          name: address.fullName, email: address.email, street: address.street,
          city: address.city, state: address.state, zip: address.zip,
          country: address.country, phone: address.phone,
        },
        paymentMethod: paymentMethod === 'tarjeta' ? 'TARJETA' : paymentMethod === 'paypal' ? 'PAYPAL' : 'TRANSFERENCIA',
      });
      console.log('✅ Pedido guardado en MongoDB');
    } catch {
      console.log('📦 Pedido guardado en localStorage (backend no disponible)');
    }

    setProcessing(false);
    setPaymentSuccess(true);
    dispatch(clearCart());
    window.scrollTo(0, 0);
  };

  const loadExampleCard = () => {
    setCard({ number: '4242 4242 4242 4242', name: 'Juan Pérez', expiry: '12/28', cvc: '123' });
  };

  if (!user && !paymentSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"><LogIn size={48} className="text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión para continuar</h2>
          <p className="text-gray-500 mb-8">Necesitas una cuenta para realizar tu compra.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/login?redirect=/checkout" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"><LogIn size={18} /> Iniciar sesión</Link>
            <Link to="/registro?redirect=/checkout" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 text-gray-900 rounded-xl font-semibold hover:bg-amber-500 transition shadow-lg shadow-amber-200"><UserPlus size={18} /> Crear cuenta</Link>
          </div>
          <Link to="/tienda" className="inline-flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-blue-600 transition"><ArrowLeft size={16} /> Seguir comprando</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !paymentSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag size={48} className="text-gray-400" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay productos para pagar</h2>
          <p className="text-gray-500 mb-8">Agrega productos al carrito para continuar.</p>
          <Link to="/tienda" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200"><ArrowLeft size={20} /> Ir a la tienda</Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} className="text-green-500" /></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">¡Pago Exitoso!</h2>
          <p className="text-gray-500 mb-6">Tu pedido ha sido procesado correctamente.</p>
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-900">Número de pedido</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-3 py-1 rounded-lg border border-gray-200 text-blue-600 font-bold">{orderId}</code>
                <button onClick={() => navigator.clipboard.writeText(orderId)} className="p-1.5 hover:bg-gray-200 rounded-lg transition" title="Copiar"><Copy size={14} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total pagado</span><span className="font-bold text-gray-900">${grandTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Método de pago</span><span className="font-medium text-gray-900 capitalize">{paymentMethod === 'tarjeta' ? 'Tarjeta de crédito' : paymentMethod === 'paypal' ? 'PayPal' : 'Transferencia bancaria'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Envío a</span><span className="font-medium text-gray-900 text-right max-w-[200px]">{address.street}, {address.city}</span></div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
            <Truck size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Recibirás un correo de confirmación</p>
              <p className="text-xs text-blue-700 mt-1">Puedes seguir tu pedido desde <strong>Mis Pedidos</strong>.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pedidos" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Ver mis pedidos</Link>
            <Link to="/tienda" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Seguir comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link to="/carrito" className="hover:text-blue-600 transition">Carrito</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Checkout</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3"><Lock size={24} className="text-blue-600" /> Finalizar Compra</h1>

      <div className="flex items-center justify-center gap-0 mb-8">
        {[{ num: 1, label: 'Dirección' }, { num: 2, label: 'Pago' }, { num: 3, label: 'Revisar' }].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= s.num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              {step > s.num ? <Check size={14} /> : <span>{s.num}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 2 && <div className={`w-8 md:w-16 h-0.5 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><MapPin size={20} className="text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-gray-900">Dirección de Envío</h2><p className="text-sm text-gray-500">Ingresa los datos para recibir tu pedido</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><User size={14} className="inline mr-1" /> Nombre completo</label>
                  <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Juan Pérez"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Mail size={14} className="inline mr-1" /> Correo electrónico</label>
                  <input type="email" name="email" value={address.email} onChange={handleAddressChange} placeholder="correo@ejemplo.com"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Phone size={14} className="inline mr-1" /> Teléfono</label>
                  <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="+507 6000-0000"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Home size={14} className="inline mr-1" /> Dirección</label>
                  <input type="text" name="street" value={address.street} onChange={handleAddressChange} placeholder="Calle, número, colonia"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.street ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                  <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="Ciudad de Panamá"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado / Provincia</label>
                  <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="Panamá"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.state ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Building size={14} className="inline mr-1" /> País</label>
                  <select name="country" value={address.country} onChange={handleAddressChange} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition bg-white">
                    <option>Panamá</option><option>Costa Rica</option><option>Colombia</option><option>México</option><option>Estados Unidos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Código Postal</label>
                  <input type="text" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="0801"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                  {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleNextStep} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
                  Continuar con el pago <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><CreditCard size={20} className="text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-gray-900">Método de Pago</h2><p className="text-sm text-gray-500">Selecciona cómo deseas pagar</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'tarjeta', label: 'Tarjeta', sub: 'Crédito / Débito', icon: CreditCard, color: 'text-blue-600' },
                  { id: 'paypal', label: 'PayPal', sub: 'Pago rápido', icon: Wallet, color: 'text-blue-500' },
                  { id: 'transferencia', label: 'Transferencia', sub: 'Bancaria', icon: Banknote, color: 'text-green-600' },
                ].map(op => (
                  <button key={op.id} onClick={() => setPaymentMethod(op.id as any)}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl transition text-left ${paymentMethod === op.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === op.id ? 'border-blue-600' : 'border-gray-300'}`}>
                      {paymentMethod === op.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <op.icon size={24} className={op.color} />
                    <div><p className="text-sm font-semibold text-gray-900">{op.label}</p><p className="text-xs text-gray-500">{op.sub}</p></div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'tarjeta' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Datos de la tarjeta</h3>
                    <button onClick={loadExampleCard} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"><Smartphone size={12} /> Cargar ejemplo</button>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-8"><CreditCard size={32} className="opacity-80" /><div className="flex gap-1"><div className="w-8 h-6 bg-red-500 rounded" /><div className="w-8 h-6 bg-yellow-500 rounded" /></div></div>
                    <p className="text-lg font-mono tracking-widest mb-4">{card.number || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between text-xs">
                      <div><p className="opacity-60 mb-0.5">Titular</p><p className="font-medium">{card.name || 'NOMBRE DEL TITULAR'}</p></div>
                      <div className="text-right"><p className="opacity-60 mb-0.5">Vence</p><p className="font-medium">{card.expiry || 'MM/AA'}</p></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de tarjeta</label>
                      <input type="text" name="number" value={card.number} onChange={handleCardChange} placeholder="4242 4242 4242 4242"
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition font-mono ${errors.number ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                      {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del titular</label>
                      <input type="text" name="name" value={card.name} onChange={handleCardChange} placeholder="Como aparece en la tarjeta"
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de expiración</label>
                      <input type="text" name="expiry" value={card.expiry} onChange={handleCardChange} placeholder="MM/AA"
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                      {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                      <input type="text" name="cvc" value={card.cvc} onChange={handleCardChange} placeholder="123"
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${errors.cvc ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                      {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <Lock size={12} className="text-green-500" /> Tus datos están protegidos con encriptación SSL
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <Wallet size={48} className="text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pago con PayPal</h3>
                  <p className="text-sm text-gray-600 mb-4">Serás redirigido a PayPal para completar el pago.</p>
                </div>
              )}

              {paymentMethod === 'transferencia' && (
                <div className="bg-green-50 rounded-xl p-6">
                  <Banknote size={48} className="text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Transferencia Bancaria</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">Realiza la transferencia a la siguiente cuenta:</p>
                  <div className="bg-white rounded-xl p-4 space-y-2 text-sm border border-green-200">
                    <div className="flex justify-between"><span className="text-gray-500">Banco:</span><span className="font-medium">Banco General</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Titular:</span><span className="font-medium">ShopMax S.A.</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cuenta:</span><span className="font-medium font-mono">04-123-456789</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Monto:</span><span className="font-bold text-green-600">${grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center gap-2"><ArrowLeft size={16} /> Regresar</button>
                <button onClick={handleNextStep} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">Revisar pedido <ChevronRight size={18} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><CheckCircle size={20} className="text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-gray-900">Revisa tu pedido</h2><p className="text-sm text-gray-500">Verifica que todo esté correcto antes de pagar</p></div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><MapPin size={14} className="text-blue-600" /> Dirección de envío</h3>
                  <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Editar</button>
                </div>
                <p className="text-sm text-gray-600">{address.fullName}<br />{address.street}<br />{address.city}, {address.state} - {address.zip}<br />{address.country}<br />{address.phone} | {address.email}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><CreditCard size={14} className="text-blue-600" /> Método de pago</h3>
                  <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Editar</button>
                </div>
                <p className="text-sm text-gray-600 capitalize">{paymentMethod === 'tarjeta' ? `Tarjeta terminada en ${card.number.slice(-4)}` : paymentMethod === 'paypal' ? 'PayPal' : 'Transferencia bancaria'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5"><Package size={14} className="text-blue-600" /> Productos ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{item.name}</p><p className="text-xs text-gray-500">Cant: {item.quantity}</p></div>
                      <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={processing}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2 ${processing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-blue-200 active:scale-[0.99]'}`}>
                {processing ? <><Loader2 size={20} className="animate-spin" /> Procesando pago...</> : <><Lock size={18} /> Pagar ${grandTotal.toFixed(2)}</>}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Al hacer clic en "Pagar" aceptas nuestros Términos y condiciones</p>
              <div className="mt-4 flex justify-center">
                <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1"><ArrowLeft size={14} /> Regresar al pago</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-96">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-blue-600" /> Resumen del Pedido</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-900 truncate">{item.name}</p><p className="text-xs text-gray-500">x{item.quantity}</p></div>
                  <p className="text-xs font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <hr className="border-gray-200 mb-4" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Envío</span><span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span></div>
              {shipping > 0 && <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2"><AlertCircle size={14} className="text-blue-600 mt-0.5 shrink-0" /><p className="text-xs text-blue-700">Agrega ${(50 - total).toFixed(2)} más para envío gratis</p></div>}
              <div className="flex justify-between"><span className="text-gray-600">Impuestos (7%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-blue-600">${grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck size={14} className="text-green-500" /> Pago 100% seguro</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Truck size={14} className="text-blue-500" /> Envío protegido</div>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Lock size={14} className="text-purple-500" /> Datos encriptados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;