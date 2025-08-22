// Importing express to create a router
import express from 'express';
import multer from 'multer';
const upload = multer({ dest: '../../public_images/' });
// Creating a new router instance
const router = express.Router();

// Importing the authentication middleware to protect routes
import authMiddleware from '../middleware/isAuthenticated.js';

// Importing the access control middleware to check user roles
import { checkAccess } from '../middleware/accessControl.js';

// Importing the get all products controller function from the productController.js file
import { getProducts, getProductById,getProductReviews,addProductReview, productCreate, updateProductById, deleteProductById, checkStock } from '../controllers/productController.js';

// viewing all products for both admin and user
router.route('/allProducts').get( getProducts);

// viewing a single product by id for both admin and user
router.route('/product/:id').get( getProductById); 

router.route('/check-stock').post( checkStock); 

router
  .route('/:id/reviews')
  .get(getProductReviews)
  .post(authMiddleware, checkAccess('user'), addProductReview);


// productCreate is used to create a new product
router.route('/addProduct').post(authMiddleware, checkAccess("admin"), upload.array('images',5), productCreate);

// updateProductById is used to update a product by id
router.route('/updateProduct/:id').put(authMiddleware, checkAccess("admin"), updateProductById); 

// deleteProductById is used to delete a product by id
router.route('/deleteProduct/:id').delete(authMiddleware, checkAccess("admin"), deleteProductById); 

// Exporting the router to be used in other files
export default router;


