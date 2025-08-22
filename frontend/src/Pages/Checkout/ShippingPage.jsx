// src/Pages/Checkout/ShippingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import authService from '../../services/authService.js';

const ShippingPage = () => {
  const { saveShippingInfo } = useCart();
  const navigate = useNavigate();

  // form state
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city:    '',
    state:   '',
    zipcode: '',
    country: '',
    phone:   '',
  });

  // past addresses from orders
  const [savedAddresses, setSavedAddresses] = useState([]);
  // which one is selected
  const [selectedId, setSelectedId] = useState(null);

  // 1) fetch past addresses on mount
  useEffect(() => {
    authService.getAddresses()
      .then(res => {
        const addrs = Array.isArray(res.data.addresses)
          ? res.data.addresses
          : [];
        setSavedAddresses(addrs);
      })
      .catch(err => {
        console.error('Failed to load saved addresses', err);
        setSavedAddresses([]);
      });
  }, []);

  // pick one
  const handleSelect = (addr) => {
    setSelectedId(addr._id);
    setShippingInfo({
      address: addr.address,
      city:    addr.city,
      state:   addr.state,
      zipcode: addr.zipcode,
      country: addr.country,
      phone:   addr.phone,
    });
  };

  // editing any field cancels “saved” selection
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'phone')   sanitized = sanitized.replace(/\D/g, '').slice(0,10);
    if (name === 'zipcode') sanitized = sanitized.replace(/\D/g, '').slice(0,6);
    setSelectedId(null);
    setShippingInfo(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // basic validation
    if (!shippingInfo.address.trim()) {
      return alert('Please enter your address.');
    }
    if (shippingInfo.phone.length !== 10) {
      return alert('Phone number must be exactly 10 digits.');
    }
    if (shippingInfo.zipcode.length !== 6) {
      return alert('Zip code must be exactly 6 digits.');
    }

    // save to context and continue
    saveShippingInfo(shippingInfo);
    navigate('/checkout/confirm');
  };

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-6">
          Shipping Information
        </h1>

        {/* — Saved Addresses — */}
        {savedAddresses.length > 0 && (
          <div className="bg-white rounded-xl shadow-card max-w-2xl mx-auto p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Choose a previous address
            </h2>
            <div className="space-y-3">
              {savedAddresses.map(addr => (
                <label
                  key={addr._id}
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={selectedId === addr._id}
                    onChange={() => handleSelect(addr)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-gray-800">
                      {addr.address}, {addr.city}, {addr.state} {addr.zipcode}, {addr.country}
                    </p>
                    <p className="text-gray-600">Phone: {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* — Address Form — */}
        <div className="bg-white rounded-xl shadow-card max-w-2xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                name="address"
                value={shippingInfo.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            {/* City & Zip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  City
                </label>
                <input
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Zip Code
                </label>
                <input
                  name="zipcode"
                  value={shippingInfo.zipcode}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            {/* State & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  State
                </label>
                <input
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Country
                </label>
                <input
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                value={shippingInfo.phone}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            {/* Continue */}
            <div className="text-right">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-xl"
              >
                Continue to Confirmation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
