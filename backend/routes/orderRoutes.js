// Importing express to create a router
import express from 'express';

// Creating a new router instance
const router = express.Router();

import authMiddleware from '../middleware/isAuthenticated.js';
import { myOrders, newOrder, getOrderDetails, updateOrders, allOrders} from '../controllers/orderController.js';
import { checkAccess } from '../middleware/accessControl.js';

router.route('/order/new').post(authMiddleware, newOrder);
router.route('/order/:id').get(authMiddleware, getOrderDetails);
router.route('/myOrders').get(authMiddleware, myOrders);

router.route('/admin/orders').get(authMiddleware, checkAccess("admin"), allOrders);
router.route('/admin/order/:id').put(authMiddleware, checkAccess("admin"), updateOrders);

// viewing all products for both admin and user




export default router;