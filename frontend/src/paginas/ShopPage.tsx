import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid3X3, List, X, ChevronRight, Star, Search as SearchIcon, Filter, ArrowUpDown, WifiOff } from 'lucide-react';
import ProductCard from '../componentes/ProductCard';
import api from '../api/client';
import { todosLosProductos, categorias } from '../datos/productos';
import type { Product } from '../tipos';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOffline, setBackendOffline] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevancia');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRating, setSelectedRating] = useState(0);
  const [soloEnvioGratis, setSoloEnvioGratis] = useState(false);

  const category = searchParams.get('categoria') || 'todas';
  const search = searchParams.get('busqueda') || '';
  const productsPerPage = 12;

  // Cargar productos (desde API o datos mock)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category && category !== 'todas') params.category = category;
        if (search) params.search = search;
        const response = await api.get('/products', { params });
        if (response.data?.success) {
          setProducts(response.data.data);
          setBackendOffline(false);
        } else {
          fallbackToMock();
        }
      } catch {
        fallbackToMock();
      } finally {
        setLoading(false);
      }
    };

    const fallbackToMock = () => {
      console.log('📦 Usando datos de demostración en Tienda');
      setBackendOffline(true);
      let filtered = [...todosLosProductos];
      if (category && category !== 'todas') {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
        );
      }
      setProducts(filtered);
    };

    fetchProducts();
  }, [category, search]);

  // Filtrar localmente
  useEffect(() => {
    let filtered = [...products];
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedRating > 0) filtered = filtered.filter((p) => Math.floor(p.rating) >= selectedRating);
    if (soloEnvioGratis) filtered = filtered.filter((p) => p.envioGratis);

    switch (sortBy) {
      case 'precio-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'nombre': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'descuento': filtered.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp); break;
      default: break;
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, priceRange, sortBy, selectedRating, soloEnvioGratis]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'todas') params.delete('categoria');
    else params.set('categoria', cat);
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const categoryName = category === 'todas' ? 'Todos los Productos' : categorias.find(c => c.id === category)?.nombre || category;

  return (
    <div>
      {backendOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-amber-700">
            <WifiOff size={14} />
            <span>Usando datos de demostración. Para usar la base de datos real, inicia el backend: <code className="bg-amber-100 px-2 py-0.5 rounded text-xs">cd backend && pnpm dev</code></span>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition">Inicio</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{categoryName}</span>
            {search && <><ChevronRight size={14} /><span className="text-gray-900 font-medium">Búsqueda: "{search}"</span></>}
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{search ? `"${search}"` : categoryName}</h1>
          <p className="text-blue-200">{filteredProducts.length} productos encontrados</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 flex' : 'hidden'} lg:relative lg:block lg:w-64 shrink-0`}>
            <div className={`${showFilters ? 'w-80 bg-white h-full overflow-y-auto p-6 animate-slideLeft' : ''} lg:bg-white lg:rounded-xl lg:p-5 lg:shadow-sm lg:border lg:border-gray-100`}>
              {showFilters && (
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Filter size={18} /> Filtros</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
              )}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Categorías</h4>
                <div className="space-y-0.5">
                  {categorias.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        ((cat.id === 'todas' && (category === 'todas' || !category)) || category === cat.id) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                      <span>{cat.icono}</span><span>{cat.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
              <hr className="border-gray-100 mb-6" />
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Rango de precio</h4>
                <div className="space-y-3">
                  <input type="range" min={0} max={3000} step={10} value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-blue-600 h-1.5" />
                  <div className="flex items-center gap-2">
                    <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Mín" />
                    <span className="text-gray-400">-</span>
                    <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Máx" />
                  </div>
                </div>
              </div>
              <hr className="border-gray-100 mb-6" />
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Valoración media</h4>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((r) => (
                    <button key={r} onClick={() => setSelectedRating(selectedRating === r ? 0 : r)}
                      className={`flex items-center gap-1.5 w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${selectedRating === r ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />))}
                      <span className="text-xs text-gray-400 ml-1">& up</span>
                    </button>
                  ))}
                </div>
              </div>
              <hr className="border-gray-100 mb-6" />
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={soloEnvioGratis} onChange={(e) => setSoloEnvioGratis(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Solo envío gratis</span>
                </label>
              </div>
              <button onClick={() => { setPriceRange([0, 3000]); setSelectedRating(0); setSoloEnvioGratis(false); setSortBy('relevancia'); }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">Limpiar todos los filtros</button>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                  <Filter size={15} /> Filtros
                </button>
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid3X3 size={16} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:inline">{filteredProducts.length} productos</span>
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-gray-400" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white">
                    <option value="relevancia">Relevancia</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                    <option value="nombre">Nombre A-Z</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="descuento">Mayor descuento</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="aspect-square bg-gray-200" /><div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/4" /><div className="h-9 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4' : 'space-y-3'}>
                {paginatedProducts.map((product) => (<ProductCard key={product._id} product={product} />))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <SearchIcon size={36} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 mb-6">Intenta con otros filtros o términos de búsqueda</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">Anterior</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>{i + 1}</button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">Siguiente</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;