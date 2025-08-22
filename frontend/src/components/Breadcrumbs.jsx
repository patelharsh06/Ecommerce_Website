// src/components/Breadcrumbs.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import productService from '../services/productService';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const { id } = useParams(); // could be productId or orderId
  const [productName, setProductName] = useState('');

  // Fetch product title when on a product detail route
  useEffect(() => {
    if (pathnames[0] === 'product' && id) {
      productService
        .getProductById(id)
        .then(res => {
          if (res.data.success) setProductName(res.data.product.title);
        })
        .catch(() => setProductName(''));
    }
  }, [pathnames, id]);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumbs" className="bg-white py-2 px-4 shadow-sm">
      <ol className="flex text-sm text-gray-600 space-x-2">
        {/* Home */}
        <li>
          <Link to="/" className="text-yellow-600 hover:text-yellow-700">
            Home
          </Link>
        </li>

        {pathnames.map((segment, idx) => {
          const lower = segment.toLowerCase();
          const isLast = idx === pathnames.length - 1;

          // --- CHECKOUT FLOW ---
          if (lower === 'checkout') {
            return (
              <li key="checkout" className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-500">Checkout</span>
              </li>
            );
          }
          if (lower === 'shipping') {
            return (
              <li key="shipping" className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-500">Shipping</span>
              </li>
            );
          }
          if (lower === 'confirm') {
            return (
              <li key="confirm" className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-500">Confirm</span>
              </li>
            );
          }

          // --- ORDER FLOW ---
          // /order (list view)
          if (lower === 'order' && pathnames.length === 1) {
            return (
              <li key="order-list" className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-500">Order</span>
              </li>
            );
          }
          // /order/:id (detail view)
          if (lower === 'order' && pathnames.length > 1 && idx === 0) {
            return (
              <React.Fragment key="order-detail">
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-gray-500">Order</span>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-gray-500">{pathnames[1]}</span>
                </li>
              </React.Fragment>
            );
          }
          // skip the raw ID segment since we've already rendered it
          if (pathnames[0] === 'order' && idx === 1) {
            return null;
          }

          // --- PRODUCTS FLOW ---
          // /products
          if (lower === 'products') {
            return (
              <li key="products" className="flex items-center">
                <span className="mx-2">/</span>
                {isLast ? (
                  <span className="text-gray-500">Products</span>
                ) : (
                  <Link to="/products" className="text-yellow-600 hover:text-yellow-700">
                    Products
                  </Link>
                )}
              </li>
            );
          }
          // /product/:id -> first segment link back to /products
          if (lower === 'product' && idx === 0) {
            return (
              <li key="product-list" className="flex items-center">
                <span className="mx-2">/</span>
                <Link to="/products" className="text-yellow-600 hover:text-yellow-700">
                  Products
                </Link>
              </li>
            );
          }
          // product detail last segment: show name instead of ID
          if (pathnames[0] === 'product' && isLast) {
            return (
              <li key="product-detail" className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-500">
                  {productName || 'Loading...'}
                </span>
              </li>
            );
          }

          // --- FALLBACK for any other routes ---
          const display = segment.charAt(0).toUpperCase() + segment.slice(1);
          const to = `/${pathnames.slice(0, idx + 1).join('/')}`;

          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-500">{display}</span>
              ) : (
                <Link to={to} className="text-yellow-600 hover:text-yellow-700">
                  {display}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
