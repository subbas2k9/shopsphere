import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, PackageOpen } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { showToast } from '../components/common/Toast';

export const WishlistPage = () => {
  const { items, removeFromWishlist, moveToCart } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (item) => {
    if (item.stock <= 0) {
      showToast('This product is currently out of stock', 'error');
      return;
    }
    const res = await addToCart(item, 1);
    if (res.success) {
      await removeFromWishlist(item.product_id || item.id);
      showToast('Moved item to shopping cart', 'success');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mx-auto text-gray-500 border border-gray-800 shadow-xl">
          <Heart className="w-10 h-10 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Your Wishlist is Empty</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Save the items you love to your wishlist and revisit them anytime.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 transition-all text-sm hover:scale-105"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Saved Wishlist</h1>
        <p className="text-xs text-gray-400 mt-1">You have {items.length} items saved in your wishlist.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const price = Number(item.price) || 0;
          const discountPrice = item.discount_price ? Number(item.discount_price) : null;
          const isOutOfStock = item.stock <= 0;

          return (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-gray-800 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-square bg-dark-900 overflow-hidden">
                <Link to={`/products/${item.slug || item.product_id || item.id}`}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <button
                  onClick={() => removeFromWishlist(item.product_id || item.id)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-dark-900/80 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">
                    {item.category_name || 'Item'}
                  </span>
                  <Link to={`/products/${item.slug || item.product_id || item.id}`}>
                    <h3 className="text-sm font-bold text-white hover:text-brand-400 transition-colors line-clamp-1 mt-1">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-extrabold text-white">
                      ${(discountPrice !== null ? discountPrice : price).toFixed(2)}
                    </span>
                    {discountPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        ${price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={isOutOfStock}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-dark-800 text-gray-500 cursor-not-allowed border border-gray-800'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
