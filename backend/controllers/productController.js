import '../config/loadEnv.js'
//importing model schema from productSchemas.js
import productSchema from '../models/productSchemas.js';
import fs from 'fs';
import path from 'path';
import cloudinaryModule from 'cloudinary';
import { error } from 'console';


const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


//getting products from the database
export const getProducts = async (req, res) => {
  try {
    // --- Build the query object for filtering (unchanged) ---
    const query = {};
    if (req.query.keyword?.trim()) {
      query.title = { $regex: req.query.keyword.trim(), $options: 'i' };
    }
    if (req.query.category?.trim()) {
      query.category = req.query.category.trim();
    }
    const { 'price[gte]': priceGte, 'price[lte]': priceLte } = req.query;
    if (priceGte != null || priceLte != null) {
      query.price = {};
      if (priceGte != null) query.price.$gte = Number(priceGte);
      if (priceLte != null) query.price.$lte = Number(priceLte);
    }

    // --- NEW: Featured filter ---
    // when ?featured=true is passed, only return items marked isFeatured=true
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // --- Sorting (unchanged) ---
    let sortOption = {};
    switch (req.query.sort) {
      case 'price-asc':    sortOption = { price: 1 };       break;
      case 'price-desc':   sortOption = { price: -1 };      break;
      case 'ratings-desc': sortOption = { ratings: -1 };    break;
      case 'newest':       sortOption = { createdAt: -1 };  break;
      default: /* no sort */                                 break;
    }

    // --- If admin asked for ALL products, skip paging altogether ---
    const wantAll = req.query.all === 'true';

    // Count total once (needed both for pagination and for admin if you want total)
    const totalProducts = await productSchema.countDocuments(query);

    let productsQuery = productSchema.find(query).sort(sortOption);

    let paginationInfo = {};
    if (!wantAll) {
      // default to 8 per page
      const perPage = Number(req.query.limit) || 8;
      const page    = Number(req.query.page)  || 1;

      productsQuery = productsQuery
        .skip(perPage * (page - 1))
        .limit(perPage);

      paginationInfo = {
        currentPage: page,
        totalPages:  Math.ceil(totalProducts / perPage),
      };
    }

    const products = await productsQuery;

    return res.status(200).json({
      success:     true,
      products,
      totalCount:  totalProducts,
      ...paginationInfo
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};
export const getProductById = async (req, res) => {
    try {
        // Use the ID from the URL parameters to find the product
        const product = await productSchema.findById(req.params.id);

        // If no product is found with that ID, return an error
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // If the product is found, return it in the response
        res.status(200).json({
            success: true,
            product, // <-- This 'product' object is what your frontend expects
        });
    }
    // If there is a server error, return 500
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
        });
    }
};


// GET  /api/products/:id/reviews
export const getProductReviews = async (req, res) => {
  try {
    const product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/products/:id/reviews
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (rating == null || comment == null) {
      return res.status(400).json({ success: false, message: 'Rating and comment required' });
    }

    const product = await productSchema.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const existing = product.reviews.find(r => r.user.toString() === userId.toString());
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment;
    } else {
      product.reviews.push({ user: userId, name: userName, rating, comment });
    }

    // Recalculate avg rating
    product.ratings = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



//creating a new product from /api/admin/products
export const productCreate = async (req, res) => {
  try{

    const uploadResults = await Promise.all(
      req.files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: 'public_images',
          use_filename: true,
          unique_filename: false,
        })
      )
    );

    // 3) Build an images array for your Product doc
    const images = uploadResults.map(r => ({
      url: r.secure_url,
      public_id: r.public_id
    }));

    // 4) Remove the temp files
    req.files.forEach(file => {
      fs.unlinkSync(path.resolve(file.path));
    });

    // 5) Create your product
    const { title, description, price, category, stock, seller,isFeatured } = req.body;
    const product = await productSchema.create({
      title,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock, 10),
      seller,
      isFeatured,
      images
    });

    return res.status(201).json({ success: true, product });
  } catch (err) {
    // console.error('Error in productCreate:', err);
    return res.status(500).json({
      err,
      success: false,
      message: 'Failed to create product'
    });
  }
};


//Updating a product by id from /api/admin/product/:id
export const updateProductById = async (req, res) => {
    try{
        // Finding the product by id from the request params
        let product = await productSchema.findById(req.params.id);
        // If product is not found, return 404
        if (!product){
            return res.status(404).json({
                error: "Product Not Found",
            })
        }
        // Updating the product with the new data
        product = await productSchema.findByIdAndUpdate(
          req.params.id,
          {...req.body, isFeatured:req.body.isFeatured},
          {new:true});
        // If product is updated successfully, return product and response code 201
        res.status(201).json({
        success: true,
        product,
        });
    } 
    // If there is an error while updating the product, return 500
    catch (error) {
        res.status(500).json({
        success: false,
    });
    }
};


//Deleting a product by id from /api/admin/product/:id
export const deleteProductById = async (req, res) => {
    try{
        // Finding the product by id from the request params
        const product = await productSchema.findById(req.params.id);
        // If product is not found, return 404
        if (!product){
            return res.status(404).json({
                error: "Product Not Found",
            })
        }
        // Deleting the product from the database
        await productSchema.deleteOne({_id: req.params.id});
        // If product is deleted successfully, return success message and response code 200
        res.status(200).json({
            success: true,
        });
    } 
    // If there is an error while deleting the product, return 500
    catch (error) {
        res.status(500).json({
        success: false,
    });
    }
};


export const checkStock = async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }, …]
  const invalid = [];

  for (let { productId, quantity } of items) {
    const prod = await productSchema.findById(productId);
    if (!prod || prod.stock < quantity) {
      invalid.push({ productId, available: prod ? prod.stock : 0 });
    }
  }

  if (invalid.length) {
    return res.status(400).json({ valid: false, invalid });
  }
  res.json({ valid: true });
};

