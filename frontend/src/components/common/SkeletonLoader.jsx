import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-gray-800/80 animate-pulse">
      <div className="w-full h-56 bg-dark-750 skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-dark-700 rounded-full" />
        <div className="h-4 w-3/4 bg-dark-700 rounded-md" />
        <div className="h-3 w-1/2 bg-dark-700 rounded-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-20 bg-dark-700 rounded-md" />
          <div className="h-9 w-9 bg-dark-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
      <div className="space-y-4">
        <div className="w-full aspect-square bg-dark-750 rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-dark-750 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-4 w-24 bg-dark-700 rounded-full" />
        <div className="h-8 w-3/4 bg-dark-700 rounded-lg" />
        <div className="h-4 w-40 bg-dark-700 rounded-full" />
        <div className="h-10 w-32 bg-dark-700 rounded-lg" />
        <div className="h-20 w-full bg-dark-700 rounded-xl" />
        <div className="h-12 w-full bg-dark-700 rounded-xl" />
      </div>
    </div>
  );
};
