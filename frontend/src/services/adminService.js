// src/services/adminService.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  withCredentials: true,
});

export const getStats = () => api.get('/stats');

export default { getStats };
