import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(credentials);
      if (response.data.success) {
        const from = location.state?.from?.pathname;
        if (from) return navigate(from, { replace: true });
        if (response.data.user.role === 'admin') return navigate('/admin/dashboard');
        return navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen flex items-center justify-center pt-6 pb-12">
      <div className="bg-white rounded-xl shadow-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            or{' '}
            <Link to="/products" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Browse Products
            </Link>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
