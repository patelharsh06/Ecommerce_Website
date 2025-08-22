// src/services/orderService.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

// Admin: Get all orders
const getAllOrders = () => {
    return api.get('/orders/admin/orders');
};

const getOrderDetails = (id) => {
    return api.get(`/orders/order/${id}`);
};

const getMyOrders = () => {
    return api.get(`/orders/myOrders`);
};

const updateOrderStatus = (id,status) => {
    return api.put(`/orders/admin/order/${id}`,{status });
};

const createOrder = (orderData) => {
    return api.post('/orders/order/new', orderData);
};

const orderService = {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    getMyOrders,
    createOrder,
};

export default orderService;