import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './componentes/Layout';
import HomePage from './paginas/HomePage';
import ShopPage from './paginas/ShopPage';
import ProductoPage from './paginas/ProductoPage';
import CartPage from './paginas/CartPage';
import CheckoutPage from './paginas/CheckoutPage';
import PedidosPage from './paginas/PedidosPage';
import LoginPage from './paginas/LoginPage';
import RegisterPage from './paginas/RegisterPage';
import AdminPage from './paginas/AdminPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/producto/:id" element={<ProductoPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;