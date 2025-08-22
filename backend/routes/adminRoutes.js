/// Importing express to create a router
import express from 'express';
// Importing the authentication middleware to protect routes
import authMiddleware from '../middleware/isAuthenticated.js';

// Importing the access control middleware to check user roles
import { checkAccess } from '../middleware/accessControl.js';
// Creating a new router instance
const router = express.Router();

//Importing the admin login controller function from the adminLogin.js file
import { adminLogout, getDashboardStats } from '../controllers/adminLogin.js';

// admin login is used to access admin routes with admin privileges

router.route('/admin/logout').get(adminLogout);

router.get(
  '/stats',
  authMiddleware,
  checkAccess('admin'),
  getDashboardStats
);

export default router;