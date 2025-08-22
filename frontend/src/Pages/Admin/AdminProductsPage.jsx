import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import productService from '../../services/productService';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts({ all: true });
        if (res.data.success) setProducts(res.data.products);
      } catch (err) {
        setError('Failed to load products',err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error)   return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Manage Products</h1>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            + Add New
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Scroll container for body; header stays sticky */}
          <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[260px]">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-28">
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 min-w-[260px]">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 w-28">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 w-24">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-4 w-40">
                      <button
                        onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
