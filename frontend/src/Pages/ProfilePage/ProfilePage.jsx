import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import authService from '../../services/authService';

const ProfilePage = () => {
  const { user, isLoading: authLoading, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name });
      orderService.getMyOrders()
        .then(res => res.data.success ? setOrders(res.data.orders) : setOrders([]))
        .catch(() => setOrders([]))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile({ name: formData.name });
      if (res.data.success) {
        setUser(res.data.user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (authLoading || isLoading) return <div className="text-center py-10">Loading profile...</div>;
  if (!user) return (
    <div className="text-center py-10">
      <p>Could not load profile. Please log in again.</p>
      <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">Go to Login</Link>
    </div>
  );

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-8">My Profile</h1>
        <div className="lg:flex lg:space-x-8 items-stretch">
          {/* User Info */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-heading font-semibold text-gray-800">User Details</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >{isEditing ? 'Cancel' : 'Edit'}</button>
              </div>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-xl transition"
                  >Save Changes</button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-gray-600 font-medium">Full Name</h3>
                    <p className="text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-600 font-medium">Email Address</h3>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-800 mb-4">Password</h2>
              <Link
                to="/profile/password"
                className="block w-full text-center bg-yellow-500 text-white py-2 rounded-xl hover:bg-yellow-600 transition"
              >Change Password</Link>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:w-2/3 flex flex-col">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-800 mb-4">My Orders</h2>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link key={order._id} to={`/order/${order._id}`} className="block">
                      <div className="flex  justify-between items-center border-b pb-3 hover:bg-gray-50 transition-colors">
                        <p className="font-mono text-sm text-gray-600">ID: {order._id}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                          {order.orderStatus}
                        </span>
                        <p className="font-semibold text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You have no orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
