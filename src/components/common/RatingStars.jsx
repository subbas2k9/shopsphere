import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5, maxStars = 5, size = 'sm', showValue = false, totalReviews = null, interactive = false, onSelect = null }) => {
  const numRating = Number(rating) || 0;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(numRating);

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onSelect && onSelect(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
            >
              <Star
                className={`${sizeClasses[size] || sizeClasses.sm} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-600 fill-gray-800'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-gray-300 ml-0.5">
          {numRating.toFixed(1)}
        </span>
      )}

      {totalReviews !== null && (
        <span className="text-xs text-gray-400">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};
