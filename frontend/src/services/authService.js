import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

const register = (userData) => {
    return api.post('/users/user/Register',userData)
}

const login = (userData) => {
    return api.post('/users/user/Login', userData)
}

const getCart = () => {
    return api.get('/users/user/cart')
}

const updateCart = (cartData) => {
    return api.put('/users/user/cart', {cart:cartData})
}

const getProfile = () => {
    return api.get('/users/user/profile')
}

const updateProfile = (profileData) => {
    return api.put('/users/user/profile', profileData)
}

const updatePassword = (passwordData) => {
    return api.put('/users/user/password', passwordData)
}
const logout = () => {
    return api.get('/users/user/Logout')
}

const getAddresses = () => {
    return api.get('/users/addresses')
}

const addAddress = (addr) => {
    return api.post('/users/addresses',addr)
}


const authService = {
    register,
    login,
    getCart,
    updateCart,
    getProfile,
    updateProfile,
    updatePassword,
    logout,
    getAddresses,
    addAddress,
};

export default authService;