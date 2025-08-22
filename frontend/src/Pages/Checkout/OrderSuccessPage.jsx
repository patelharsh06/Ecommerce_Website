import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6 text-center">
        <div className="bg-white rounded-xl shadow-card inline-block p-8">
          <h1 className="text-4xl font-heading font-bold text-green-600 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Thank you for your purchase.
          </p>
          <Link
            to="/products"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
