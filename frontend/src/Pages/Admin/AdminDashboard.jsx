// src/Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers:    0,
    totalProducts: 0,
    salesToday:    0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminService.getStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tiles = [
    { label: 'Users',       value: stats.totalUsers,    color: 'bg-blue-500' },
    { label: 'Products',    value: stats.totalProducts, color: 'bg-green-500' },
    { label: 'Sales Today', value: stats.salesToday,    color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
              ))
            : tiles.map(({ label, value, color }) => (
                <div
                  key={label}
                  className={`${color} text-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center space-y-2 hover:shadow-xl transition`}
                >
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-lg font-medium">{label}</p>
                </div>
              ))
          }
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, Administrator</h2>
          <p className="text-gray-600">
            Use the sidebar to manage users, products, orders, and settings. Check real-time statistics above for a quick overview.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
