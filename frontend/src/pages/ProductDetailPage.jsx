import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Star,
  MessageSquare
} from 'lucide-react';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailSkeleton } from '../components/common/SkeletonLoader';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/common/Toast';
import api from '../services/api';

export const ProductDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'reviews'

  // Review submission form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${idOrSlug}`);
        if (res.data.success) {
          const prod = res.data.product;
          setProduct(prod);
          setActiveImage(prod.images?.[0] || prod.image_url);
          setQuantity(1);
        }
      } catch (err) {
        showToast(err.message || 'Product not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-gray-400">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="inline-block bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl">
          Back to Products
        </Link>
      </div>
    );
  }

  const originalPrice = Number(product.price) || 0;
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const currentPrice = discountPrice !== null ? discountPrice : originalPrice;
  const inWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    const res = await addToCart(product, quantity);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    const res = await addToCart(product, quantity);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a product review', 'error');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 3) {
      showToast('Please write a detailed review (at least 3 characters)', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.data.success) {
        showToast('Thank you! Your review has been published.', 'success');
        setReviewComment('');
        // Refresh product details
        const refreshed = await api.get(`/products/${product.id}`);
        if (refreshed.data.success) {
          setProduct(refreshed.data.product);
        }
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-white">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category_slug || product.category_id}`} className="hover:text-white capitalize">
          {product.category_name || 'Category'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden glass-panel border border-gray-800 p-2 shadow-2xl">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl transition-all duration-300"
            />
            {discountPrice && (
              <span className="absolute top-6 left-6 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                SAVE ${(originalPrice - discountPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Thumbnail Gallery Strip */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`aspect-square rounded-2xl overflow-hidden glass-card p-1 border transition-all ${
                    activeImage === imgUrl
                      ? 'border-brand-500 shadow-glow ring-2 ring-brand-500/50'
                      : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Buying Box */}
        <div className="space-y-6">
          
          {/* Header info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                {product.category_name}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                product.stock > 10
                  ? 'badge-emerald'
                  : product.stock > 0
                  ? 'badge-amber'
                  : 'badge-rose'
              }`}>
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating || 5} size="sm" showValue={true} />
              <span className="text-gray-600">&bull;</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-brand-400 hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{product.num_reviews || 0} Customer Reviews</span>
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-dark-800/80 border border-gray-800 flex items-baseline gap-4">
            <span className="text-3xl font-black text-white">
              ${currentPrice.toFixed(2)}
            </span>
            {discountPrice && (
              <>
                <span className="text-base text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {Math.round(((originalPrice - discountPrice) / originalPrice) * 100)}% Discount
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & CTAs */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Quantity</label>
              
              <div className="flex items-center bg-dark-800 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 text-gray-300 hover:text-white hover:bg-dark-700 disabled:opacity-40 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-white min-w-[40px] text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  className="px-3.5 py-2 text-gray-300 hover:text-white hover:bg-dark-700 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-gray-400">
                (Max: {product.stock})
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:text-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-dark-700 disabled:text-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-5 h-5" />
                <span>Buy Now</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                  inWish
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-dark-800 border-gray-700 text-gray-300 hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-800 text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Fast 2-Day Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>30-Day Returns</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div className="pt-8 border-t border-gray-800">
        <div className="flex border-b border-gray-800 gap-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'description'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Customer Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed space-y-4">
              <p>{product.description}</p>
              <p>
                Crafted with rigorous quality standards, each unit is checked for acoustic precision, thermal integrity, and long-lasting durability before dispatch.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
              <div className="p-3 bg-dark-800 rounded-xl border border-gray-800 flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold text-white">{product.category_name}</span>
              </div>
              <div className="p-3 bg-dark-800 rounded-xl border border-gray-800 flex justify-between">
                <span className="text-gray-400">Stock Availability</span>
                <span className="font-semibold text-white">{product.stock} units</span>
              </div>
              <div className="p-3 bg-dark-800 rounded-xl border border-gray-800 flex justify-between">
                <span className="text-gray-400">Condition</span>
                <span className="font-semibold text-white">Brand New Factory Sealed</span>
              </div>
              <div className="p-3 bg-dark-800 rounded-xl border border-gray-800 flex justify-between">
                <span className="text-gray-400">Warranty</span>
                <span className="font-semibold text-white">24 Months Global</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Review submission form */}
              <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
                <h3 className="text-base font-bold text-white">Write a Customer Review</h3>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Rating</label>
                    <RatingStars
                      rating={reviewRating}
                      interactive={true}
                      onSelect={(val) => setReviewRating(val)}
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Your Experience</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on build quality, performance, or delivery..."
                      className="w-full bg-dark-800 border border-gray-700 text-sm text-gray-200 rounded-xl p-3 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-dark-800/60 border border-gray-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.user_name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                        </div>
                        <RatingStars rating={rev.rating} size="xs" />
                      </div>
                      <p className="text-xs text-gray-300">{rev.comment}</p>
                      <p className="text-[10px] text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-800 space-y-6">
          <h2 className="text-xl font-bold text-white">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
