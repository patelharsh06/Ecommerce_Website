import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import orderService from '../../services/orderService';

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchOrderDetails = async () => {
        try {
          const response = await orderService.getOrderDetails(id);
          if (response.data.success) setOrder(response.data.order);
        } catch (err) {
          setError('Failed to fetch order details.',err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [id]);

  if (isLoading) {
    return <div className="text-center py-10">Loading order details...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  if (!order) {
    return <div className="text-center py-10">Order not found.</div>;
  }

  return (
    <div className="bg-yellow-50 min-h-screen pt-6 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <h1 className="text-3xl font-heading font-bold text-gray-800 mb-8">Order Details</h1>
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="mb-6 border-b pb-4">
            <p className="mb-2">
              <strong className="font-medium">Order ID:</strong>{' '}
              <span className="font-mono text-gray-700">{order._id}</span>
            </p>
            <p>
              <strong className="font-medium">Status:</strong>{' '}
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">Shipping Address</h2>
              <p className="text-gray-700">{order.shippingInfo.address}</p>
              <p className="text-gray-700">
                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipcode}
              </p>
              <p className="text-gray-700">{order.shippingInfo.country}</p>
              <p className="text-gray-700 mt-2">
                <strong className="font-medium">Phone:</strong> {order.shippingInfo.phone}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-gray-800 mb-2">Order Summary</h2>
              <div className="flex justify-between text-gray-700 mb-1">
                <span>Items Total</span>
                <span>₹{order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 mb-1">
                <span>Tax</span>
                <span>₹{order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-heading font-bold text-lg mt-4 pt-4 border-t">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-heading font-semibold text-gray-800 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.orderItems.map(item => (
                <div key={item.productId} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading='lazy'
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-heading font-semibold text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
