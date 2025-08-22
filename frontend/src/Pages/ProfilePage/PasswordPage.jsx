import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';

const COOLDOWN_SECONDS = 60;

const PasswordPage = () => {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Start cooldown timer when cooldown > 0
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cooldown > 0) return;  // Prevent submit during cooldown

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (!formData.oldPassword || !formData.newPassword) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updatePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      if (res.data.success) {
        alert('Password updated successfully! Please log in again.');
        logout();
        navigate('/login');
      } else {
        setError(res.data.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
      setCooldown(COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6 text-center">
          Change Password
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Current Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-xl disabled:opacity-50 transition"
          >
            {loading ? 'Updating…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPage;
