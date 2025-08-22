// src/Pages/Admin/AdminOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService'; // Using the new service
import { Link } from 'react-router-dom';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderService.getAllOrders();
                if (response.data.success) {
                    setOrders(response.data.orders);
                }
            } catch (err) {
                setError('Failed to fetch orders.',err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (isLoading) return <div>Loading orders...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Order ID</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Items</th>
                            <th className="text-left p-3">Total Amount</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{order._id}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.orderStatus === 'Delivered' ? 'bg-green-200 text-green-800' :
                                        order.orderStatus === 'Shipped' ? 'bg-blue-200 text-blue-800' :
                                        'bg-yellow-200 text-yellow-800'
                                    }`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="p-3">{order.orderItems.length}</td>
                                <td className="p-3">${order.totalAmount.toFixed(2)}</td>
                                <td className="p-3">
                                    <Link to={`/admin/order/${order._id}`} className="text-blue-600 hover:underline">View Details</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdersPage;