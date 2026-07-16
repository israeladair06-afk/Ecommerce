import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, HeadphonesIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../componentes/ProductCard';
import api from '../api/client';
import { todosLosProductos } from '../datos/productos';
import type { Product } from '../tipos';

const heroSlides = [
  {
    title: 'Ofertas Increíbles',
    subtitle: 'Hasta 50% OFF en productos seleccionados',
    description: 'Descubre las mejores ofertas en electrónicos, moda, hogar y más.',
    cta: 'Ver Ofertas',
    link: '/tienda?categoria=Electrónicos',
    bg: 'from-blue-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80',
  },
  {
    title: 'Nueva Colección',
    subtitle: 'Tendencias de moda 2026',
    description: 'Renueva tu guardarropa con lo último en estilo y confort.',
    cta: 'Ver Colección',
    link: '/tienda?categoria=Ropa',
    bg: 'from-purple-600 to-pink-600',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
  },
  {
    title: 'Tecnología',
    subtitle: 'Los últimos gadgets y dispositivos',
    description: 'Smartphones, laptops, tablets y más al mejor precio.',
    cta: 'Ver Tecnología',
    link: '/tienda?categoria=Electrónicos',
    bg: 'from-gray-800 to-gray-900',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80',
  },
];

const categories = [
  { name: 'Electrónicos', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80', count: 245 },
  { name: 'Ropa', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80', count: 189 },
  { name: 'Hogar', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&q=80', count: 156 },
  { name: 'Deportes', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80', count: 98 },
  { name: 'Juguetes', image: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=300&q=80', count: 134 },
  { name: 'Libros', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=80', count: 87 },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?sort=rating&limit=8');
        if (response.data?.success) {
          setFeaturedProducts(response.data.data);
        } else {
          setFeaturedProducts(todosLosProductos.filter(p => p.destacado).slice(0, 8));
        }
      } catch {
        // Si el backend no está disponible, usar datos mock
        console.log('📦 Usando datos de demostración (backend no disponible)');
        setFeaturedProducts(todosLosProductos.filter(p => p.destacado).slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-r ${heroSlides[currentSlide].bg} transition-all duration-700`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex flex-col lg:flex-row items-center min-h-[400px] lg:min-h-[500px] py-12 lg:py-0">
              <div className="flex-1 text-center lg:text-left z-10 animate-fadeIn">
                <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium mb-4 backdrop-blur-sm">
                  {heroSlides[currentSlide].subtitle}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
                  {heroSlides[currentSlide].description}
                </p>
                <Link to={heroSlides[currentSlide].link} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition shadow-xl hover:shadow-2xl active:scale-95">
                  {heroSlides[currentSlide].cta} <ArrowRight size={20} />
                </Link>
              </div>
              <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
                <div className="relative">
                  <img src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].title} className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-2xl shadow-2xl animate-slideUp" />
                  <div className="absolute -bottom-4 -left-4 bg-yellow-400 rounded-xl p-4 shadow-lg animate-pulse-slow">
                    <p className="text-2xl font-bold text-gray-900">50%</p>
                    <p className="text-xs font-semibold text-gray-700">OFF</p>
                  </div>
                </div>
              </div>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"><ChevronLeft size={24} /></button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"><ChevronRight size={24} /></button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, text: 'Envío Gratis', sub: 'En pedidos +$50', color: 'blue' },
              { icon: Shield, text: 'Pago Seguro', sub: 'Datos protegidos', color: 'green' },
              { icon: RefreshCw, text: '30 Días', sub: 'Devolución gratis', color: 'purple' },
              { icon: HeadphonesIcon, text: 'Soporte 24/7', sub: 'Ayuda en línea', color: 'orange' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center shrink-0`}>
                  <item.icon size={24} className={`text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Categorías</h2>
              <p className="text-gray-500 mt-1">Explora nuestras categorías populares</p>
            </div>
            <Link to="/tienda" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">Ver todas <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/tienda?categoria=${encodeURIComponent(cat.name)}`} className="group relative overflow-hidden rounded-2xl aspect-square">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base">{cat.name}</h3>
                  <p className="text-white/70 text-xs">{cat.count} productos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Productos Destacados</h2>
              <p className="text-gray-500 mt-1">Los más vendidos de esta semana</p>
            </div>
            <Link to="/tienda" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">Ver todo <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/4" />
                    <div className="h-9 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner promocional */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 py-12">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-3">Oferta por tiempo limitado</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">¡Ofertas Flash!</h2>
                <p className="text-white/80 text-lg max-w-md">Descuentos de hasta 60% en productos seleccionados. ¡Corre, el tiempo se acaba!</p>
              </div>
              <Link to="/tienda" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 rounded-full font-semibold hover:bg-gray-100 transition shadow-xl active:scale-95">Comprar Ahora <ArrowRight size={20} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-500 mt-1">Más de 50,000 clientes satisfechos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'María García', text: 'Excelente servicio y productos de calidad. El envío fue muy rápido y el producto llegó en perfectas condiciones.', rating: 5 },
              { name: 'Carlos López', text: 'La mejor tienda en línea que he usado. Los precios son competitivos y la atención al cliente es excepcional.', rating: 5 },
              { name: 'Ana Martínez', text: 'Compré un laptop y llegó antes de lo esperado. Muy recomendada, volveré a comprar sin duda.', rating: 5 },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />))}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">{testimonial.name.charAt(0)}</div>
                  <p className="font-medium text-sm text-gray-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;