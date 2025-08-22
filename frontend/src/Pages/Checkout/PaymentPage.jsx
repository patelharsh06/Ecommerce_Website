import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const PaymentPage = () => {
  const { cartItems, shippingInfo, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const itemsPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxPrice = itemsPrice * 0.18;
  const totalAmount = itemsPrice + taxPrice;

  const handleProcessOrder = async () => {
    setIsLoading(true);
    const orderData = {
      shippingInfo,
      orderItems: cartItems.map(item => ({
        name: item.title,
        quantity: item.quantity,
        image: item.images[0]?.url,
        price: item.price,
        productId: item._id,
      })),
      paymentMethod,
      paymentInfo: { id: 'sample_payment_id', status: 'succeeded' },
      itemsPrice,
      taxPrice,
      totalAmount,
    };

    try {
      const response = await orderService.createOrder(orderData);
      if (response.data.success) {
        clearCart();
        navigate('/checkout/success');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-6 text-center">
          Choose Payment Method
        </h1>
        <div className="bg-white rounded-xl shadow-card max-w-md mx-auto p-6">
          <div className="space-y-4 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="form-radio text-yellow-500 h-5 w-5 mr-2"
              />
              <span className="text-gray-700">Cash on Delivery (COD)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="form-radio text-yellow-500 h-5 w-5 mr-2"
              />
              <span className="text-gray-700">Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
                className="form-radio text-yellow-500 h-5 w-5 mr-2"
              />
              <span className="text-gray-700">UPI</span>
            </label>
          </div>
          <p className="mb-6 text-lg text-gray-800 text-center">
            Your total amount is <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
          </p>
          <button
            onClick={handleProcessOrder}
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;