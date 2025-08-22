// src/Pages/HomePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import SkeletonCard from '../../components/SkeletonCard';

const HomePage = () => {
  const [newArrivals, setNewArrivals]       = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  // const [bestSellers, setBestSellers]       = useState([]);
  const [topRated, setTopRated]             = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [loadingArrivals, setLoadingArrivals]   = useState(true);
  const [loadingFeatured, setLoadingFeatured]   = useState(true);
  // const [loadingBest, setLoadingBest]           = useState(true);
  const [loadingTop, setLoadingTop]             = useState(true);

  useEffect(() => {
    // New Arrivals
    productService.getAllProducts({ sort: 'newest', limit: 5 })
      .then(res => {
        if (res.data.success) setNewArrivals(res.data.products);
      })
      .catch(console.error)
      .finally(() => setLoadingArrivals(false));

    // Featured Products
    productService.getAllProducts({ featured: true, limit: 5 })
      .then(res => {
        if (res.data.success) setFeaturedProducts(res.data.products);
      })
      .catch(console.error)
      .finally(() => setLoadingFeatured(false));

    // Best Sellers (placeholder: sort by ratings descending)
    // productService.getAllProducts({ sort: 'ratings-desc', limit: 5 })
    //   .then(res => {
    //     if (res.data.success) setBestSellers(res.data.products);
    //   })
    //   .catch(console.error)
    //   .finally(() => setLoadingBest(false));

    // Top Rated (same metric here)
    productService.getAllProducts({ sort: 'ratings-desc', limit: 5 })
      .then(res => {
        if (res.data.success) setTopRated(res.data.products);
      })
      .catch(console.error)
      .finally(() => setLoadingTop(false));

    // Recently Viewed
    const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(rv);
  }, []);

  const categories = [
    'Electronics', 'Cameras', 'Laptops', 'Accessories',
    'Headphones', 'Food', 'Books', 'Sports'
  ];

  const renderSection = (title, items, isLoading) => (
    <div className="container mx-auto px-6 mb-12">
      <h2 className="text-3xl font-heading font-bold text-gray-800 mb-8 text-center">
        {title}
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-4">
          {items.map(product => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="block transform hover:scale-105 transition duration-300"
            >
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="h-40 bg-gray-200">
                  {product.images?.[0]?.url && (
                    <img
                      src={product.images[0].url}
                      loading="lazy"
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.title}
                  </h3>
                  <p className="text-yellow-600 mt-2 font-bold">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-yellow-50 min-h-screen">
      {/* Hero */}
      <div className="text-center py-8 px-6 bg-yellow-50 shadow-md mb-12">
        <h1 className="text-5xl font-heading font-bold text-gray-800 mb-4">
          Welcome to Our Store!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover our handpicked collection of amazing products.
        </p>
        <Link
          to="/products"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-xl text-lg transition-transform transform hover:scale-105"
        >
          Shop Now
        </Link>
      </div>

      {/* Shop by Category */}
      <div className="container mx-auto px-6 py-3">
        <h2 className="text-3xl font-heading font-bold text-gray-800 mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map(category => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="block"
            >
              <div className="bg-yellow-100 hover:bg-yellow-500 text-yellow-600 hover:text-white py-8 rounded-xl shadow-card transition-colors text-center">
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sections */}
      {renderSection('New Arrivals',   newArrivals,   loadingArrivals)}
      {renderSection('Featured Products', featuredProducts, loadingFeatured)}
      {/* {renderSection('Best Sellers',   bestSellers,    loadingBest)} */}
      {renderSection('Top Rated',      topRated,       loadingTop)}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="container mx-auto px-6 mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-800 mb-6 text-center">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentlyViewed.map(prod => (
              <Link
                key={prod._id}
                to={`/product/${prod._id}`}
                className="block transform hover:scale-105 transition duration-200"
              >
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className="h-32 bg-gray-200">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        loading="lazy"
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {prod.title}
                    </h3>
                    <p className="text-yellow-600 font-bold">
                      ₹{prod.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default HomePage;
