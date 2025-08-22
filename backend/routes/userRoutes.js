// Importing express to create a router
import express from 'express';

// Creating a new router instance
const router = express.Router();
// Importing the user product controller functions from the productController.js file
import { getUserProfile, userLogin, userLogout, userRegister, getMyAddresses, updateUserProfile, updatePassword, getAllUsers, getUserCart, UpdateUserCart, deleteUser } from "../controllers/userLogin.js";

// Importing the authentication middleware to protect routes
import authMiddleware from '../middleware/isAuthenticated.js';

import { checkAccess } from '../middleware/accessControl.js';

// userRegister is used to register a new user
router.route('/user/Register').post(userRegister);

// userLogin is used to login a user
router.route('/user/Login').post(userLogin);

// userLogin is used to login a user
router.route('/user/Logout').get(authMiddleware,userLogout);

router.route('/admin/users').get(authMiddleware,checkAccess("admin"),getAllUsers);

router.route('/admin/users/:id').delete(authMiddleware,checkAccess("admin"),deleteUser)

router.route('/user/cart').get(authMiddleware,getUserCart);

router.route('/user/cart').put(authMiddleware,UpdateUserCart);

router.get('/addresses', authMiddleware, getMyAddresses);

// userLogin is used to login a user
router.route('/user/profile').get(authMiddleware,getUserProfile).put(authMiddleware, updateUserProfile);

router.route('/user/password').put(authMiddleware, updatePassword);

export default router;