import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // sync search input from URL
  useEffect(() => {
    const kw = searchParams.get('keyword');
    setSearchKeyword(kw || '');
  }, [searchParams]);

  const debouncedSearch = useMemo(
    () =>
      debounce(q => {
        navigate(q.trim() ? `/products?keyword=${q}` : '/products');
      }, 500),
    [navigate]
  );
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleChange = e => {
    setSearchKeyword(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalItemsInCart = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bg-white text-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-heading font-bold text-yellow-600">
          <Link to="/">Shoppers Cart</Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex items-center">
            <input
              type="search"
              placeholder="Search for products..."
              value={searchKeyword}
              onChange={handleChange}
              className="w-full px-4 py-2 text-gray-800 bg-gray-100 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
            <button
              onClick={() => debouncedSearch.flush()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-r-md transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Cart & Auth */}
        <div className="flex items-center space-x-6">
          {![ '/login', '/register' ].includes(location.pathname) && (
            <Link
              to="/cart"
              className="relative hover:text-yellow-500 transition"
            >
              <ShoppingCart size={24} />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-3 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItemsInCart}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-yellow-500 transition">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-500 transition">
                Login
              </Link>
              <Link to="/register" className="hover:text-yellow-500 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
