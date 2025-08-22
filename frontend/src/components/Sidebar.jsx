import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiBox, FiHome, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const sidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { path: '/admin/products', label: 'Products', icon: <FiBox /> },
  // { path: '/admin/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { path: '/admin/users', label: 'Users', icon: <FiUsers /> }
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {logout} = useAuth(); 

  const handleLogout = async () => {
    // Call logout logic here
    await logout()
    navigate('/login',{replace: true});
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 text-white flex flex-col">
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {sidebarItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center p-3 rounded-md transition-colors hover:bg-indigo-600 ${
              location.pathname === item.path ? 'bg-indigo-800' : ''
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 bg-red-500 rounded-md hover:bg-red-600 transition-colors"
        >
          <FiLogOut className="mr-2 text-lg" /> Logout
        </button>
      </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
