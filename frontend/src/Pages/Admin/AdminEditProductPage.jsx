import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';

const categories = [
  'Electronics','Cameras','Laptops','Accessories','Headphones','Food','Books','Sports','Outdoor','Home'
];

const AdminEditProductPage = () => {
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    seller: '',
    isFeatured: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productService.getProductById(id);
        if (data.success) {
          const { title, description, price, category, stock, seller, isFeatured } = data.product;
          setProductData({ title, description, price: price.toString(), category, stock: stock.toString(), seller, isFeatured });
        }
      } catch (err) {
        setError('Failed to fetch product details.',err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newVal = value;
    if (name === 'price') {
      newVal = newVal.replace(/[^0-9.]/g, '');
      const parts = newVal.split('.');
      if (parts.length > 2) newVal = parts.shift() + '.' + parts.join('');
      newVal = newVal.replace(/^0+([1-9])/, '$1');
    }
    if (name === 'stock') {
      newVal = newVal.replace(/\D/g, '');
      newVal = newVal.replace(/^0+([1-9])/, '$1');
    }
    setProductData(prev => ({ ...prev, [name]: newVal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        ...productData,
        price: parseFloat(productData.price) || 0,
        stock: parseInt(productData.stock) || 0,
      };
      const response = await productService.updateProduct(id, payload);
      if (response.data.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 ">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium text-gray-700">Product Title</label>
            <input
              id="title"
              name="title"
              value={productData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium text-gray-700">Description</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block mb-1 font-medium text-gray-700">Price (₹)</label>
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
              <label htmlFor="stock" className="block mb-1 font-medium text-gray-700">Stock</label>
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

          <div>
            <label htmlFor="category" className="block mb-1 font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="seller" className="block mb-1 font-medium text-gray-700">Seller Name</label>
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

          <div className="text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProductPage;
