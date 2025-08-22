// src/Pages/CartPage/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const GST_RATE = 0.18;

  const [removingIds, setRemovingIds] = useState([]);
  const [notification, setNotification] = useState('');

  // compute totals
  const totalItems   = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal     = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalTax     = subtotal * GST_RATE;
  const totalWithTax = subtotal + totalTax;

  // helper to show a brief notification
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  // ← UPDATED: async stock check before checkout
  const handleCheckout = async () => {
    if (totalItems === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }

    try {
      await productService.checkStock(
        cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      );
      navigate('/checkout/shipping');
    } catch (err) {
      const invalid = err.response?.data?.invalid;
      if (Array.isArray(invalid) && invalid.length) {
        const msgs = invalid.map(i =>
          `• ${i.productId}: only ${i.available} in stock`
        ).join('\n');
        alert('Some items are out of stock:\n' + msgs);
      } else {
        alert('Unable to verify stock availability. Please try again.');
      }
    }
  };

  const handleRemove = (id) => {
    setRemovingIds(ids => [...ids, id]);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds(ids => ids.filter(x => x !== id));
      showNotification('Removed from cart');
    }, 300);
  };

  const handleDecrease = (item) => {
    updateQuantity(item._id, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.stock) {
      showNotification('Cannot exceed available stock');
      return;
    }
    updateQuantity(item._id, item.quantity + 1);
  };

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      {/* Notification banner */}
      {notification && (
        <div className="fixed top-24 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      <div className="container mx-auto px-4 lg:flex lg:space-x-8">
        {/* Items List */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-card p-6 space-y-4">
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-6">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">Your cart is empty.</p>
              <Link
                to="/products"
                className="mt-4 inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartItems.map(item => {
              const isRemoving = removingIds.includes(item._id);
              const itemTotal  = item.quantity * item.price;
              const itemTax    = itemTotal * GST_RATE;
              return (
                <div
                  key={item._id}
                  className={`flex flex-col md:flex-row justify-between items-center border-b last:border-0 py-4 transition-opacity ${
                    isRemoving ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center space-x-4 w-full md:w-1/2">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {item.images?.[0]?.url && (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg text-gray-800">
                        {item.title}
                      </h2>
                      <p className="text-gray-600">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="text-gray-600 text-sm">
                        GST (18%): ₹{itemTax.toFixed(2)}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        In Stock: {item.stock}
                      </p>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-600 hover:text-red-700 mt-2 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0 md:w-1/2 justify-end">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="px-3 py-1 bg-gray-200 rounded-md"
                    >
                      −
                    </button>
                    <span className="text-gray-800 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      disabled={item.quantity >= item.stock}
                      className={`px-3 py-1 rounded-md ${
                        item.quantity >= item.stock
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gray-200'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3 relative mt-8 lg:mt-0">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-xl font-heading font-semibold mb-4 border-b pb-2">
              Order Summary
            </h2>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>GST (18%)</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>Total</span>
              <span>₹{totalWithTax.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
