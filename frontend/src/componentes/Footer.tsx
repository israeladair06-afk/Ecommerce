import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, Phone, MapPin, Camera, Play } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">¡No te pierdas ninguna oferta!</h3>
              <p className="text-blue-100 mt-1">Suscríbete y recibe descuentos exclusivos</p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="px-5 py-3 rounded-full w-full md:w-72 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition whitespace-nowrap">
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1 - Marca */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                <span className="text-blue-400">Shop</span>Max
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Tu tienda en línea de confianza. Los mejores productos al mejor precio, con envío rápido y seguro a todo el país.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition" title="Facebook">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition" title="Twitter">
                <span className="text-xs font-bold">𝕏</span>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition" title="Instagram">
                <Camera size={14} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition" title="YouTube">
                <Play size={14} />
              </a>
            </div>
          </div>

          {/* Columna 2 - Enlaces */}
          <div>
            <h4 className="text-white font-semibold mb-4">Compra</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/tienda" className="hover:text-blue-400 transition">Todos los productos</Link></li>
              <li><Link to="/tienda?categoria=Electrónicos" className="hover:text-blue-400 transition">Electrónicos</Link></li>
              <li><Link to="/tienda?categoria=Ropa" className="hover:text-blue-400 transition">Ropa y Moda</Link></li>
              <li><Link to="/tienda?categoria=Hogar" className="hover:text-blue-400 transition">Hogar</Link></li>
              <li><Link to="/tienda?categoria=Deportes" className="hover:text-blue-400 transition">Deportes</Link></li>
              <li><Link to="/ofertas" className="hover:text-blue-400 transition">Ofertas especiales</Link></li>
            </ul>
          </div>

          {/* Columna 3 - Ayuda */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contacto" className="hover:text-blue-400 transition">Centro de ayuda</Link></li>
              <li><Link to="/envios" className="hover:text-blue-400 transition">Envíos y entregas</Link></li>
              <li><Link to="/devoluciones" className="hover:text-blue-400 transition">Devoluciones</Link></li>
              <li><Link to="/pagos" className="hover:text-blue-400 transition">Métodos de pago</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 4 - Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contáctanos</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-blue-400 shrink-0" />
                <span>Av. Principal 123, Ciudad de Panamá</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-blue-400 shrink-0" />
                <span>+507 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-blue-400 shrink-0" />
                <span>info@shopmax.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 ShopMax. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacidad" className="hover:text-gray-300 transition">Privacidad</Link>
            <Link to="/terminos" className="hover:text-gray-300 transition">Términos</Link>
            <Link to="/cookies" className="hover:text-gray-300 transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;