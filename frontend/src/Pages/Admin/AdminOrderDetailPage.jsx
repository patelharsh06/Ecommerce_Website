// src/Pages/Admin/AdminOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const AdminOrderDetailPage = () => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if(id){
            const fetchOrder = async () => {
                try {
                    const response = await orderService.getOrderDetails(id);
                    if (response.data.success) {
                        setOrder(response.data.order);
                        setStatus(response.data.order.orderStatus);
                    }
                } catch (err) {
                    setError('Failed to fetch order details.',err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrder();
        }
    }, [id]);

    const handleStatusUpdate = async () => {
        if (!status) return;
        try {
            await orderService.updateOrderStatus(id, status);
            alert('Order status updated successfully!');
            navigate('/admin/orders');
        } catch (err) {
            alert('Failed to update order status.');
            console.error(err);
        }
    };

    if (isLoading) return <div>Loading order details...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items & Shipping */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Order ID: <span className="font-mono text-base">{order._id}</span></h2>
                        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
                        <p>{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                        <p>{order.shippingInfo.state}, {order.shippingInfo.zipcode}, {order.shippingInfo.country}</p>
                        <p>Phone: {order.shippingInfo.phone}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                        {order.orderItems.map(item => (
                            <div key={item.productId} className="flex items-center justify-between border-b py-3">
                                <div className="flex items-center space-x-4">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Status Update & Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 border rounded-md mb-4"
                        >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={handleStatusUpdate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;