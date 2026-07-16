import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, Truck, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../lib/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { obtenerImagen } from '../utilidades/imagenes';
import type { Product } from '../tipos';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      _id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: obtenerImagen(product.images[0], product.category),
      quantity: 1,
      inStock: product.inStock,
    }));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
      />
    ));
  };

  return (
    <Link to={`/producto/${product._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={obtenerImagen(product.images[0], product.category)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={(e) => { 
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = 'true';
                target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
              }
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-pulse-slow">
                -{discount}%
              </span>
            )}
            {product.envioGratis && (
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <Truck size={10} /> Envío gratis
              </span>
            )}
            {product.destacado && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                ★ Destacado
              </span>
            )}
            {!product.inStock && (
              <span className="bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                Agotado
              </span>
            )}
          </div>

          {/* Botones hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 flex flex-col gap-1.5">
            <button className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition" title="Añadir a favoritos">
              <Heart size={14} />
            </button>
            <button className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 transition" title="Vista rápida">
              <Eye size={14} />
            </button>
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
            <div className="flex items-center">{renderStars(product.rating)}</div>
            <span className="text-[11px] font-semibold text-gray-700">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.numReviews.toLocaleString()})</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem] leading-snug">
            {product.name}
          </h3>

          {/* Precios */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">${product.mrp.toFixed(2)}</span>
            )}
          </div>

          {/* Cuotas */}
          <p className="text-[11px] text-green-600 font-medium mt-0.5">
            Hasta 12 cuotas de ${(product.price / 12).toFixed(2)}
          </p>

          {/* Garantía */}
          {product.garantia && (
            <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
              <ShieldCheck size={10} /> Garantía de {product.garantia}
            </p>
          )}

          {/* Botón comprar */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full mt-2.5 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              product.inStock
                ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 active:scale-[0.97] shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={14} />
            {product.inStock ? 'Agregar al carrito' : 'Agotado'}
          </button>

          {/* Prime */}
          {product.envioGratis && (
            <div className="flex items-center gap-1 mt-1.5 justify-center">
              <Truck size={10} className="text-green-600" />
              <span className="text-[10px] text-green-600 font-medium">Envío GRATIS</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;