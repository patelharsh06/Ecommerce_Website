import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});
const getProductById = (id) => {
    return api.get(`/products/product/${id}`);
}

const getCategories = () => api.get('/products/categories');

const submitReview = (productId, reviewData) =>
  api.post(`/products/${productId}/reviews`, reviewData);

const getAllProducts = (params= {}) => {
    return api.get('/products/allProducts',{params});
};
const createProduct = (formData) =>
  api.post('/products/addProduct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
const updateProduct = (id,productData) => {
    return api.put(`/products/updateProduct/${id}`,productData);
};
const deleteProduct = (id) => {
    return api.delete(`/products/deleteProduct/${id}`);
};

const checkStock = (items) => {
    return api.post('/products/check-stock',{items})
}
const productService = {
    getAllProducts,
    getProductById,
    submitReview,
    createProduct,
    updateProduct,
    deleteProduct, 
    getCategories,
    checkStock,
};

export default productService
