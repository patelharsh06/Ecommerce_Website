import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';

import HomePage from './Pages/HomePage/HomePage.jsx';
import LoginPage from './Pages/LoginPage/LoginPage.jsx';
import RegisterPage from './Pages/RegisterPage/RegisterPage.jsx';
import ProductPage from './Pages/ProductPage/ProductPage.jsx';
import ProductDetailPage from './Pages/ProductDetailPage/ProductDetailPage.jsx';
import CartPage from './Pages/CartPage/CartPage.jsx';
import ProfilePage from './Pages/ProfilePage/ProfilePage.jsx';
import PasswordPage from './Pages/ProfilePage/PasswordPage.jsx';
import OrderDetailPage from './Pages/OrderDetailPage/OrderDetailPage.jsx';
import ShippingPage from './Pages/Checkout/ShippingPage.jsx';
import ConfirmOrderPage from './Pages/Checkout/ConfirmOrderPage.jsx';
import PaymentPage from './Pages/Checkout/PaymentPage.jsx';
import OrderSuccessPage from './Pages/Checkout/OrderSuccessPage.jsx';

import AdminDashboard from './Pages/Admin/AdminDashboard.jsx';
import AdminProductsPage from './Pages/Admin/AdminProductsPage.jsx';
import AdminAddProductPage from './Pages/Admin/AdminAddProductPage.jsx';
import AdminEditProductPage from './Pages/Admin/AdminEditProductPage.jsx';
import AdminUsersPage from './Pages/Admin/AdminUsersPage.jsx';

import NotFoundPage from './Pages/NotFoundPage/NotFoundPage.jsx';

import { AuthProvider } from './context/AuthProvider.jsx';
import { CartProvider } from './context/CartProvider.jsx';

// Main layout with Navbar + Breadcrumbs
const MainLayout = () => (
  <>
    <Navbar />
    <div className="container mx-auto px-6 py-4">
      <Breadcrumbs />
    </div>
    <Outlet />
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-yellow-50">
            <Routes>
              {/* === Admin routes === */}
              <Route element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/products/new" element={<AdminAddProductPage />} />
                  <Route path="/admin/product/edit/:id" element={<AdminEditProductPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              {/* === Public + Protected user routes === */}
              <Route element={<MainLayout />}>
                {/* Public-only pages */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Public pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                

                {/* User-only pages */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/password" element={<PasswordPage />} />
                  <Route path="/order/:id" element={<OrderDetailPage />} />
                  <Route path="/checkout/shipping" element={<ShippingPage />} />
                  <Route path="/checkout/confirm" element={<ConfirmOrderPage />} />
                  <Route path="/checkout/payment" element={<PaymentPage />} />
                  <Route path="/checkout/success" element={<OrderSuccessPage />} />
                </Route>
                  <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
