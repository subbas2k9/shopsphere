import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { showToast } from './Toast';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const originalPrice = Number(product.price) || 0;
  const discountPrice = product.discount_price ? Number(product.discount_price) : null;
  const currentPrice = discountPrice !== null ? discountPrice : originalPrice;
  const discountPercent = discountPrice
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const inWish = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      showToast('This product is out of stock', 'error');
      return;
    }
    const res = await addToCart(product, 1);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleWishlist(product);
    if (res.success) {
      showToast(res.message, res.inWishlist ? 'success' : 'info');
    }
  };

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      {/* Image & Badges Container */}
      <div className="relative w-full h-60 bg-dark-850 overflow-hidden">
        <Link to={`/products/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured === 1 && (
            <span className="bg-brand-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        {/* Quick Action Floating Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-200 shadow-lg ${
              inWish
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-dark-900/60 border-white/10 text-gray-300 hover:text-white hover:bg-dark-900/90'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          
          <Link
            to={`/products/${product.slug || product.id}`}
            aria-label="Quick View"
            className="p-2.5 rounded-xl bg-dark-900/60 border border-white/10 text-gray-300 hover:text-white hover:bg-dark-900/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hidden sm:flex"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-dark-950/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-dark-800 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span className="font-medium text-brand-400">{product.category_name || 'General'}</span>
            <span className={product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-rose-400'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug || product.id}`}>
            <h3 className="text-base font-semibold text-gray-100 line-clamp-1 hover:text-brand-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="mt-2 flex items-center justify-between">
            <RatingStars
              rating={product.rating || 5}
              showValue={true}
              totalReviews={product.num_reviews}
              size="xs"
            />
          </div>
        </div>

        {/* Price and Cart Button */}
        <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              {discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
              isOutOfStock
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed border border-gray-800'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
