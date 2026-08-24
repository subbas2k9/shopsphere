import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategorySection } from '../components/home/CategorySection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { SpecialOffers } from '../components/home/SpecialOffers';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { Newsletter } from '../components/home/Newsletter';
import api from '../services/api';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=24')
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
        if (prodRes.data.success) {
          setProducts(prodRes.data.products || []);
        }
      } catch (error) {
        console.error('[HomePage Load Error]:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories */}
      <CategorySection categories={categories} />

      {/* Featured Products */}
      <FeaturedSection products={products} loading={loading} />

      {/* Special Deals Countdown */}
      <SpecialOffers product={products.find((p) => p.id === 13)} />

      {/* Customer Testimonials */}
      <ReviewsSection />

      {/* Newsletter Promo */}
      <Newsletter />
    </div>
  );
};
