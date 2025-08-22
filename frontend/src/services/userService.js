// src/services/userService.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

// Admin: Get all users
const getAllUsers = () => {
    // We will need to create this backend route next
    return api.get('/users/admin/users');
};

const deleteUser = (id) => {
    // We will need to create this backend route next
    return api.delete(`/users/admin/users/${id}`);
};

const userService = {
    getAllUsers,
    deleteUser,
};

export default userService;