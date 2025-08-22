// src/Pages/ProductDetailPage/ProductDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import productService from "../../services/productService.js";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth.js";

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // lightbox state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ⬇️ Added updateQuantity from cart (existing API)
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();

  // 1) Fetch product & its reviews, track recently viewed
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await productService.getProductById(id);
        if (data.success) {
          setProduct(data.product);
          setReviews(data.product.reviews || []);

          // update recentlyViewed
          const seen = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const deduped = seen.filter(p => p._id !== data.product._id);
          deduped.unshift({
            _id: data.product._id,
            title: data.product.title,
            image: data.product.images?.[0]?.url,
            price: data.product.price
          });
          localStorage.setItem("recentlyViewed", JSON.stringify(deduped.slice(0, 5)));
        } else {
          setError("Failed to load product.");
        }
      } catch {
        setError("Failed to fetch product details.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // 2) Pending add-to-cart after login (no notification)
  useEffect(() => {
    const pending = location.state?.productToAdd;
    if (pending && isAuthenticated) {
      const inCart = cartItems.find(i => i._id === pending._id);
      if (!inCart || inCart.quantity < pending.stock) {
        addToCart(pending);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, isAuthenticated, addToCart, cartItems, navigate, location.pathname]);

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)      return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product)   return <div className="text-center py-10">Product not found.</div>;

  const inCart = cartItems.find(i => i._id === product._id);
  const currentQty = inCart?.quantity || 0;
  const atMax  = inCart && product?.stock != null && currentQty >= product.stock;
  const canDecrement = inCart && currentQty > 1;
  const canIncrement = inCart && (product?.stock == null || currentQty < product.stock);

  // Add to Cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      return navigate("/login", { state: { from: location, productToAdd: product } });
    }
    if (product.stock === 0) {
      return alert("This product is out of stock.");
    }
    if (atMax) {
      return alert("You have added the maximum available stock to your cart.");
    }
    addToCart(product);
  };

  // Remove from Cart
  const handleRemoveFromCart = () => {
    removeFromCart(product._id);
  };

  // Quantity controls (use existing updateQuantity from context)
  const handleDecrease = () => {
    if (!inCart) return;
    const next = currentQty - 1;
    updateQuantity(product._id, next); // provider removes if <= 0
  };

  const handleIncrease = () => {
    if (!inCart) return;
    if (product?.stock != null && currentQty >= product.stock) return;
    updateQuantity(product._id, currentQty + 1);
  };

  // Submit Review
  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      return navigate("/login", { state: { from: location } });
    }
    if (!comment.trim()) {
      return alert("Please enter your review.");
    }
    try {
      await productService.submitReview(id, { rating, comment });
      const { data } = await productService.getProductById(id);
      setReviews(data.product.reviews || []);
      setComment("");
      setRating(5);
    } catch {
      alert("Failed to submit review.");
    }
  };

  // Lightbox Controls
  const openLightbox = i => { setCurrentImageIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setCurrentImageIndex(i => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () => setCurrentImageIndex(i => (i + 1) % product.images.length);

  return (
    <div className="bg-yellow-50 min-h-screen py-12">
      <div className="container mx-auto px-6 space-y-8">

        {/* — Product Info — */}
        <div className="relative bg-white p-8 rounded-lg shadow-md md:flex md:space-x-8">
          {/* Image Gallery */}
          <div className="md:w-1/2">
            <div
              className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openLightbox(currentImageIndex)}
            >
              <img
                src={product.images[currentImageIndex]?.url}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${product.title} ${idx+1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2
                    ${idx === currentImageIndex ? 'border-yellow-500' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="md:w-1/2 flex flex-col">
            <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">{product.title}</h1>
            <p className="text-gray-600 mt-4 flex-1">{product.description}</p>

            <div className="mt-6 flex items-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">
                ₹{product.price.toFixed(2)}
              </span>
              <span className={`text-lg font-semibold ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-4">
              {/* Show Add to Cart only when NOT in cart */}
              {!inCart ? (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition ${
                    product.stock > 0
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add to Cart
                </button>
              ) : (
                <>
                  {/* Quantity Stepper + Remove */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Stepper */}
                    <div className="inline-flex items-center rounded-lg border shadow-sm overflow-hidden">
                      <button
                        onClick={handleDecrease}
                        disabled={!canDecrement}
                        className={`px-4 py-2 font-semibold ${
                          canDecrement ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-200 cursor-not-allowed'
                        }`}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <div className="px-5 py-2 min-w-[3rem] text-center font-semibold">
                        {currentQty}
                      </div>
                      <button
                        onClick={handleIncrease}
                        disabled={!canIncrement}
                        className={`px-4 py-2 font-semibold ${
                          canIncrement ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-200 cursor-not-allowed'
                        }`}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={handleRemoveFromCart}
                      className="w-full sm:w-auto py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition"
                    >
                      Remove from Cart
                    </button>
                  </div>

                  {/* Optional: stock ceiling hint */}
                  {atMax && (
                    <p className="text-sm text-gray-500">
                      You’ve reached the maximum available stock.
                    </p>
                  )}
                </>
              )}

              {/* Place Order (unchanged) */}
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* — Reviews List — */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          {reviews.length === 0
            ? <p className="text-gray-600">No reviews yet.</p>
            : reviews.map(r => (
                <div key={r._id} className="border-b last:border-0 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-yellow-500">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{r.comment}</p>
                </div>
              ))}
        </div>

        {/* — Write a Review — */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="border rounded px-3 py-2 w-24"
              >
                {[5,4,3,2,1].map(n => (
                  <option key={n} value={n}>
                    {n} Star{n>1?'s':''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* — Lightbox Overlay — */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-3xl"
          >&times;</button>
          <button
            onClick={prevImage}
            className="absolute left-6 text-white text-4xl"
          >&#8249;</button>
          <img
            src={product.images[currentImageIndex].url}
            alt="Full size"
            className="max-h-full max-w-full"
          />
          <button
            onClick={nextImage}
            className="absolute right-6 text-white text-4xl"
          >&#8250;</button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
