import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Package,
  LogOut, Settings, MapPin, ChevronRight
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import { logout } from '../store/slices/authSlice';
import { categorias } from '../datos/productos';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { user } = useAppSelector((state) => state.auth);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      setShowTopBar(window.scrollY < 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tienda?busqueda=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior - ofertas */}
      <div className={`bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs transition-all duration-300 overflow-hidden ${showTopBar ? 'max-h-8 py-1.5' : 'max-h-0 py-0'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="animate-pulse-slow">🔥 Ofertas Flash - Hasta 50% OFF</span>
          <span className="hidden sm:block">📦 Envío gratis en pedidos +$50</span>
          <span className="hidden md:block">💰 Pagos seguros con Stripe</span>
        </div>
      </div>

      {/* Barra principal */}
      <div className={`bg-white transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-2">
            {/* Menú móvil */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg transition-all group-hover:scale-105">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold">
                  <span className="text-blue-600">Shop</span><span className="text-gray-800">Max</span>
                </span>
                <p className="text-[10px] text-gray-400 -mt-1 font-medium">Tu tienda de confianza</p>
              </div>
            </Link>

            {/* Ubicación */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-blue-600 cursor-pointer rounded-lg hover:bg-blue-50 transition">
              <MapPin size={16} />
              <div className="text-xs">
                <p className="text-gray-400 font-medium">Enviar a</p>
                <p className="font-semibold text-gray-800 text-sm">Panamá City</p>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-2xl mx-2">
              <div className="relative w-full group">
                <div className="flex">
                  <select className="hidden lg:block px-3 py-2.5 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-full text-xs text-gray-600 cursor-pointer hover:bg-gray-200 transition focus:border-blue-500 focus:outline-none">
                    <option>Todas</option>
                    {categorias.filter(c => c.id !== 'todas').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar productos, marcas y más..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                    style={{ borderRadius: 0 }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium transition flex items-center gap-1.5 rounded-r-full"
                  >
                    <Search size={18} />
                    <span className="hidden lg:inline">Buscar</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Acciones derecha */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Idioma/moneda */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1.5 text-gray-600 hover:text-blue-600 cursor-pointer rounded-lg hover:bg-blue-50 transition text-sm">
                <span role="img" aria-label="spanish">🇵🇦</span>
                <ChevronDown size={12} />
              </div>

              {/* Cuenta */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden lg:block text-left text-xs">
                      <p className="text-gray-400">Hola, {user.name.split(' ')[0]}</p>
                      <p className="font-semibold text-gray-800 text-sm">Mi cuenta</p>
                    </div>
                    <ChevronDown size={12} className="hidden lg:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 animate-scaleIn">
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                            <User size={16} /> Mi Perfil
                          </Link>
                          <Link to="/pedidos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                            <Package size={16} /> Mis Pedidos
                          </Link>
                          <Link to="/favoritos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                            <Heart size={16} /> Favoritos
                          </Link>
                          {user.isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                              <Settings size={16} /> Panel Admin
                            </Link>
                          )}
                          <hr className="my-1 border-gray-100" />
                          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition w-full">
                            <LogOut size={16} /> Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="text-gray-400">Hola, Invitado</p>
                    <p className="font-semibold text-gray-800 text-sm">Iniciar sesión</p>
                  </div>
                </Link>
              )}

              {/* Pedidos */}
              <Link to="/pedidos" className="hidden lg:flex flex-col items-center px-2 py-1.5 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                <Package size={18} />
                <span className="text-[10px] font-medium">Pedidos</span>
              </Link>

              {/* Carrito */}
              <Link to="/carrito" className="relative flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                <div className="relative">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-red-200 animate-scaleIn">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="text-gray-400">Mi</p>
                  <p className="font-semibold text-gray-800 text-sm">Carrito</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Barra de categorías secundaria */}
        <div className="hidden lg:block bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-blue-600 hover:text-white transition-all group-hover:bg-blue-600 group-hover:text-white">
                <Menu size={16} />
                TODAS LAS CATEGORÍAS
                <ChevronDown size={14} />
              </button>
              <div className="absolute left-0 mt-0 w-64 bg-white rounded-b-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  {categorias.filter(c => c.id !== 'todas').map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/tienda?categoria=${encodeURIComponent(cat.id)}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition group/item"
                    >
                      <span>{cat.icono}</span>
                      <span className="flex-1">{cat.nombre}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover/item:text-blue-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-1 ml-4">
              <Link to="/" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium">Inicio</Link>
              <Link to="/tienda" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium">Ofertas</Link>
              <Link to="/tienda?categoria=Electrónicos" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Electrónicos</Link>
              <Link to="/tienda?categoria=Ropa" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Ropa</Link>
              <Link to="/tienda?categoria=Hogar" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Hogar</Link>
              <Link to="/tienda?categoria=Deportes" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Deportes</Link>
              <Link to="/tienda?categoria=Salud" className="px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">Salud</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto animate-slideDown">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none text-sm"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            <nav className="space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition font-medium">
                <span>🏠</span> Inicio
              </Link>
              <Link to="/tienda" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition font-medium">
                <span>🛍️</span> Tienda
              </Link>
              <Link to="/carrito" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition">
                <ShoppingCart size={18} /> Carrito
                {cartCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">{cartCount}</span>}
              </Link>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Categorías</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {categorias.filter(c => c.id !== 'todas').map((cat) => (
                    <Link key={cat.id} to={`/tienda?categoria=${encodeURIComponent(cat.id)}`} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                    >
                      <span>{cat.icono}</span> {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Cuenta</p>
                {user ? (
                  <>
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition"><User size={18} /> Mi Perfil</Link>
                    <Link to="/pedidos" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition"><Package size={18} /> Mis Pedidos</Link>
                    <Link to="/favoritos" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition"><Heart size={18} /> Favoritos</Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition w-full"><LogOut size={18} /> Cerrar Sesión</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition font-medium"><User size={18} /> Iniciar Sesión</Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;