  import { useState, useEffect } from 'react';
  import { Link, useSearchParams, useNavigate } from 'react-router-dom';
  import productService from '../../services/productService';

  // Pagination controls component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-10">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        <span className="font-semibold">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('');
    const [priceRange, setPriceRange] = useState([0, 20000]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const keyword = searchParams.get('keyword') || '';

    useEffect(() => {
      const fetchProducts = async () => {
        setIsLoading(true);
        setError('');
        try {
          const params = {
            page: currentPage,
            category,
            keyword,
            sort,
            'price[gte]': priceRange[0],
            'price[lte]': priceRange[1],
          };
          const response = await productService.getAllProducts(params);
          if (response.data.success) {
            let fetched = response.data.products;
            // enforce correct client-side sorting
            if (sort === 'price-asc') {
              fetched = fetched.slice().sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
              fetched = fetched.slice().sort((a, b) => b.price - a.price);
            }
            setProducts(fetched);
            setTotalPages(response.data.totalPages);
          }
        } catch (err) {
          setError('Failed to fetch products. Please try again later.');
          setProducts([]);
          console.error('Error fetching products:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }, [currentPage, category, keyword, sort, priceRange]);

    const handlePageChange = page => setCurrentPage(page);
    const handleCategoryChange = e => { setCategory(e.target.value); setCurrentPage(1); };
    const handleSortChange = e => setSort(e.target.value);
    const handleMinPriceChange = e => { setPriceRange([Number(e.target.value), priceRange[1]]); setCurrentPage(1); };
    const handleMaxPriceChange = e => { setPriceRange([priceRange[0], Number(e.target.value)]); setCurrentPage(1); };
    const handleClearFilters = () => {
      setCategory('');
      setSort('');
      setPriceRange([0, 20000]);
      setCurrentPage(1);
      navigate('/products');
    };

    return (
      <div className="bg-yellow-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Products</h1>
          <div className="flex flex-wrap justify-end mb-8 items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="min-price" className="mr-2 text-sm font-medium text-gray-700">Min:</label>
              <input
                id="min-price"
                type="number"
                min="0"
                value={priceRange[0]}
                onChange={handleMinPriceChange}
                className="px-3 py-2 border rounded-md w-[11ch]"
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="max-price" className="mr-2 text-sm font-medium text-gray-700">Max:</label>
              <input
                id="max-price"
                type="number"
                min={priceRange[0]}
                value={priceRange[1]}
                onChange={handleMaxPriceChange}
                className="px-3 py-2 border rounded-md w-[11ch]"
              />
            </div>
            <select onChange={handleSortChange} value={sort} className="px-4 py-2 border rounded-md">
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <select onChange={handleCategoryChange} value={category} className="px-4 py-2 border rounded-md">
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Cameras">Cameras</option>
              <option value="Laptops">Laptops</option>
              <option value="Accessories">Accessories</option>
              <option value="Headphones">Headphones</option>
              <option value="Food">Food</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Home">Home</option>
            </select>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Clear Filters
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Link key={product._id} to={`/product/${product._id}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-48 bg-gray-200">
                        {product.images?.[0]?.url && (
                          <img src={product.images[0].url} loading='lazy' alt={product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h3>
                        <p className="text-gray-600 mt-2">₹{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <p className="text-center text-gray-500">No products found matching your criteria.</p>
          )}
        </div>
      </div>
    );
  };

  export default ProductPage;
