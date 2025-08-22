// src/Pages/Checkout/ConfirmOrderPage.jsx
import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const ConfirmOrderPage = () => {
  const { cartItems, shippingInfo, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const GST_RATE = 0.18;

  const [checkingStock, setCheckingStock] = useState(false);

  const subtotal     = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalTax     = subtotal * GST_RATE;
  const totalWithTax = subtotal + totalTax;

  const handleProceedToPayment = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setCheckingStock(true);
    try {
      // call your new check-stock endpoint
      await productService.checkStock(
        cartItems.map(i => ({ productId: i._id, quantity: i.quantity }))
      );
      // if valid, go on
      navigate('/checkout/payment');
    } catch (err) {
      if (err.response?.status === 400 && Array.isArray(err.response.data.invalid)) {
        const invalid = err.response.data.invalid;
        // map to product titles
        const names = invalid.map(({ productId }) => {
          const item = cartItems.find(i => i._id === productId);
          return item ? item.title : productId;
        });
        // ask user to remove them
        const msg = 
          `The following product(s) are out of stock:\n\n` +
          names.join('\n') +
          `\n\nClick OK to remove them from your cart.`;
        if (window.confirm(msg)) {
          invalid.forEach(({ productId }) => removeFromCart(productId));
        }
      } else {
        alert('Could not verify stock. Please try again.');
      }
    } finally {
      setCheckingStock(false);
    }
  };

  const handleDecrease = item => {
    const nextQ = item.quantity - 1;
    if (nextQ <= 0) removeFromCart(item._id);
    else           updateQuantity(item._id, nextQ);
  };

  const handleIncrease = item => {
    updateQuantity(item._id, item.quantity + 1);
  };

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-6">
          Confirm Your Order
        </h1>
        <div className="lg:flex lg:space-x-8">
          {/* — Shipping & Items — */}
          <div className="lg:w-2/3 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 border-b pb-2">
                Shipping Address
              </h2>
              <p>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}</p>
              <p>{shippingInfo.zipcode}, {shippingInfo.country}</p>
              <p>Phone: {shippingInfo.phone}</p>
            </div>
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 border-b pb-2">
                Your Cart Items
              </h2>
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center justify-between border-b pb-3 mb-3">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.images[0]?.url}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  {/* quantity controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="px-2 py-1 bg-gray-200 rounded-md"
                    >−</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="px-2 py-1 bg-gray-200 rounded-md"
                    >+</button>
                  </div>
                  <p className="font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* — Order Summary & Action — */}
          <div className="lg:w-1/3 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-xl font-heading font-bold border-b pb-4 mb-4">
                Order Summary
              </h2>
              <div className="flex justify-between text-gray-700 mb-2">
                <span>Subtotal</span>
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
                onClick={handleProceedToPayment}
                disabled={checkingStock}
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition
                  ${checkingStock
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'}
                `}
              >
                {checkingStock ? 'Checking stock…' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderPage;
