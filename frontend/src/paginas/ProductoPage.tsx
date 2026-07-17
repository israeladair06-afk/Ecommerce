import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Truck, ShieldCheck, ChevronRight, Minus, Plus, Check, Share2, ChevronLeft, Package, RefreshCw, HeadphonesIcon, Clock } from 'lucide-react';
import { useAppDispatch } from '../lib/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { obtenerImagen } from '../utilidades/imagenes';
import api from '../api/client';
import ProductCard from '../componentes/ProductCard';
import type { Product } from '../tipos';

const ProductoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data?.success) {
          setProduct(response.data.data);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        try {
          const response = await api.get(`/products?category=${product.category}&limit=5`);
          if (response.data?.success) {
            setRelatedProducts(response.data.data.filter((p: Product) => p._id !== product._id).slice(0, 5));
          }
        } catch (error) {
          console.error('Error al cargar relacionados:', error);
        }
      };
      fetchRelated();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-12 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Producto no encontrado</h2>
        <p className="text-gray-500 mb-8">El producto que buscas no está disponible.</p>
        <Link to="/tienda" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-200">
          <ChevronLeft size={20} /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const renderStars = (rating: number, size: number = 16) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={size} className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
    ));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: obtenerImagen(product.images[0], product.category),
      quantity,
      inStock: product.inStock,
    }));
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const reviews = [
    { name: 'Carlos M.', rating: 5, text: 'Excelente producto, superó mis expectativas. La calidad es increíble y llegó antes de lo esperado.', date: 'Hace 2 días', verified: true },
    { name: 'Laura G.', rating: 4, text: 'Muy buen producto, relación calidad-precio excelente. Lo recomiendo.', date: 'Hace 1 semana', verified: true },
    { name: 'Andrés P.', rating: 5, text: 'Compra 100% recomendada. El envío fue rápido y el producto es original.', date: 'Hace 2 semanas', verified: true },
  ];

  return (
    <div className="pb-12">
      {showAlert && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl animate-slideDown flex items-center gap-2">
          <Check size={18} /> ¡Agregado al carrito!
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition">Inicio</Link>
            <ChevronRight size={14} />
            <Link to="/tienda" className="hover:text-blue-600 transition">Tienda</Link>
            <ChevronRight size={14} />
            <Link to={`/tienda?categoria=${encodeURIComponent(product.category)}`} className="hover:text-blue-600 transition">{product.category}</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div>
              <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100">
                <img 
                  src={obtenerImagen(product.images[selectedImage], product.category, selectedImage)} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'; }}
                />
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">-{discount}%</div>
                )}
                <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition" title="Compartir">
                  <Share2 size={18} />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      selectedImage === index ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'
                    }`}>
                    <img 
                      src={obtenerImagen(img, product.category, index)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'; }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                <span className="text-lg font-bold text-blue-600">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.numReviews.toLocaleString()} calificaciones)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${product.mrp.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">Ahorras ${(product.mrp - product.price).toFixed(2)}</span>
                  </>
                )}
              </div>

              <p className="text-sm text-green-600 font-medium">Hasta 12 cuotas sin interés de <span className="font-bold">${(product.price / 12).toFixed(2)}</span></p>
              <p className="text-xs text-gray-400">Precios con IVA incluido</p>

              {product.especificaciones && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Características principales:</h3>
                  <ul className="space-y-1.5">
                    {product.especificaciones.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" />{spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> En stock - Envío inmediato
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full" /> Producto agotado
                  </span>
                )}
              </div>

              {product.garantia && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck size={16} className="text-blue-500" /> Garantía del fabricante: {product.garantia}
                </div>
              )}

              <hr className="border-gray-200" />

              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-3 hover:bg-gray-50 transition disabled:opacity-50"><Minus size={16} /></button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition"><Plus size={16} /></button>
                </div>
                <span className="text-sm text-gray-500">{quantity > 1 ? `${quantity} unidades` : '1 unidad'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleAddToCart} disabled={!product.inStock}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg ${
                    product.inStock ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 active:scale-[0.98] shadow-amber-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}>
                  <ShoppingCart size={18} /> {product.inStock ? 'Agregar al carrito' : 'Agotado'}
                </button>
                <button onClick={() => { handleAddToCart(); navigate('/checkout'); }} disabled={!product.inStock}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    product.inStock ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}>
                  <ShoppingCart size={18} /> Comprar ahora
                </button>
              </div>

              <div className="bg-green-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <Truck size={16} /> {product.envioGratis ? 'Envío GRATIS a todo el país' : 'Envío disponible'}
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Clock size={14} /> Entrega estimada: 3-5 días hábiles
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center gap-1"><RefreshCw size={16} className="text-blue-500" /><span>Devolución 30 días</span></div>
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center gap-1"><ShieldCheck size={16} className="text-blue-500" /><span>Pago seguro</span></div>
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center gap-1"><Truck size={16} className="text-blue-500" /><span>Envío protegido</span></div>
                <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center gap-1"><HeadphonesIcon size={16} className="text-blue-500" /><span>Soporte 24/7</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Opiniones de clientes</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-72 text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900">{product.rating}</div>
              <div className="flex items-center justify-center md:justify-start gap-0.5 mt-2">{renderStars(product.rating, 20)}</div>
              <p className="text-sm text-gray-500 mt-1">{product.numReviews.toLocaleString()} calificaciones globales</p>
              <button className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition">Escribir reseña</button>
            </div>
            <div className="flex-1 space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-0.5 mb-1">{renderStars(review.rating, 14)}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{review.name}</span>
                    {review.verified && <span className="flex items-center gap-0.5 text-[11px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded"><Check size={10} /> Compra verificada</span>}
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Ver todas las reseñas →</button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoPage;