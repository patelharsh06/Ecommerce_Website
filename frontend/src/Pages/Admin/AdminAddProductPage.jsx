// src/Pages/Admin/AdminAddProductPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const categories = [
  'Electronics','Cameras','Laptops','Accessories',
  'Headphones','Food','Books','Sports','Outdoor','Home'
];

const AdminAddProductPage = () => {
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    seller: '',
    isFeatured: false,
    images: []  // will hold File objects
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({}); // { title?: string }
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // clear field-specific error when user edits that field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'images') {
      // convert FileList to Array<File>
      setProductData(prev => ({ ...prev, images: Array.from(files) }));
    } else {
      setProductData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({}); // reset field-level errors

    try {
      // Build FormData for multipart upload
      const fd = new FormData();
      fd.append('title', productData.title);
      fd.append('description', productData.description);
      fd.append('price', parseFloat(productData.price) || 0);
      fd.append('category', productData.category);
      fd.append('stock', parseInt(productData.stock) || 0);
      fd.append('seller', productData.seller);
      // send as string to be safe in multipart form parsing
      fd.append('isFeatured', productData.isFeatured ? 'true' : 'false');
      productData.images.forEach(file => fd.append('images', file));

      // Make sure productService.createProduct sends FormData correctly
      const response = await productService.createProduct(fd);
      if (response.data.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      // Prefer backend-provided message/code; also check nested "err" object your backend returns
      const resp = err.response?.data || {};
      const backendMsg = resp.message || err.message || 'Failed to create product.';
      const serverErr = resp.err || {}; // <- nested detailed error from backend
      const backendCode = resp.code ?? serverErr.code;

      // Consolidate possible raw strings to inspect
      const rawMsg = [
        backendMsg,
        serverErr.errmsg,
        String(err) // as a last resort
      ].filter(Boolean).join(' | ');

      // Detect Mongo duplicate key on title (E11000)
      const isDup =
        backendCode === 11000 ||
        serverErr.code === 11000 ||
        /E11000/i.test(rawMsg) ||
        /duplicate key/i.test(rawMsg);

      const isTitleDup =
        isDup && (
          /title/i.test(rawMsg) ||
          resp.keyPattern?.title === 1 ||
          resp.keyValue?.title ||
          serverErr.keyPattern?.title === 1 ||
          serverErr.keyValue?.title
        );

      if (isTitleDup) {
        setFieldErrors(prev => ({
          ...prev,
          title: 'A product with this title already exists. Title must be unique.'
        }));
        setError('Title must be unique. Please use a different product title.');
      } else {
        setError(backendMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
              Product Title
            </label>
            <input
              id="title"
              name="title"
              value={productData.title}
              onChange={handleChange}
              required
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'title-error' : undefined}
              className={
                `w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 ` +
                (fieldErrors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500')
              }
            />
            {fieldErrors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={productData.description}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block mb-1 font-medium text-gray-700">
                Price (₹)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={productData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block mb-1 font-medium text-gray-700">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={productData.stock}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block mb-1 font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Seller */}
          <div>
            <label htmlFor="seller" className="block mb-1 font-medium text-gray-700">
              Seller Name
            </label>
            <input
              id="seller"
              name="seller"
              value={productData.seller}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Is Featured */}
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={productData.isFeatured}
                onChange={e =>
                  setProductData(prev => ({ ...prev, isFeatured: e.target.checked }))
                }
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Feature this product</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="images" className="block mb-1 font-medium text-gray-700">
              Product Images
            </label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full text-gray-700"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can select multiple images.
            </p>
          </div>

          {/* Submit */}
          <div className="text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProductPage;
