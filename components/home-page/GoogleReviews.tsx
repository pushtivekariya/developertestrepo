'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Divider } from '@/components/ui/Divider';
import { Badge } from '@/components/ui/Badge';

interface ReviewItem {
  author: string;
  rating: number;
  content: string;
}

interface ReviewsContent {
  tagline: {
    type: string;
    content: string;
  };
  subtitle: {
    tag: string;
    type: string;
    content: string;
  };
  description: {
    type: string;
    content: string;
  };
  reviews: {
    type: string;
    items: ReviewItem[];
  };
  button_link_1: {
    url: string;
    text: string;
    type: string;
  };
  button_link_2: {
    url: string;
    text: string;
    type: string;
    content: string;
  };
}

interface GoogleReviewsProps {
  reviewsContent: ReviewsContent;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ reviewsContent }) => {
  const reviewsData = reviewsContent?.reviews?.items || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance the carousel every 6 seconds
  useEffect(() => {
    if (!mounted || reviewsData.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviewsData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted, reviewsData.length]);

  // Safety check for empty reviews - AFTER all hooks
  if (!reviewsData || reviewsData.length === 0) {
    return null;
  }
  
  const goToPrev = () => {
    setActiveIndex((activeIndex - 1 + reviewsData.length) % reviewsData.length);
  };

  const goToNext = () => {
    setActiveIndex((activeIndex + 1) % reviewsData.length);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  // Get current review
  const currentReview = reviewsData[activeIndex];
  
  // Calculate average rating
  const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;

  return (
    <section className="py-16 bg-theme-bg/30 relative">
      <Divider position="top" />
      
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">{reviewsContent?.tagline?.content || ''}</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
            {reviewsContent?.subtitle?.content || ''}
          </h2>
          <div className="flex items-center justify-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  fill="#FFD700" 
                  color="#FFD700" 
                  size={24} 
                  className="mr-1"
                />
              ))}
            </div>
            <span className="ml-2 text-lg font-medium">{averageRating.toFixed(1)} out of 5</span>
          </div>
          <p className="text-theme-body max-w-2xl mx-auto">
            {reviewsContent?.description?.content || ''}
          </p>
        </div>
        
        {/* Reviews Carousel */}
        <div className="relative mb-10 max-w-3xl mx-auto">
          {/* Previous Button */}
          <button 
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft size={24} className="text-primary" />
          </button>
          
          {/* Single Review Container */}
          <div className="overflow-hidden px-12">
            <div 
              key={activeIndex}
              className="bg-card-bg rounded-lg shadow-md p-8 border border-card-border/30 mx-auto transition-opacity duration-500"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary mr-3">
                  {currentReview.author.trim().charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-primary text-lg">{currentReview.author.trim()}</h4>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    fill={i < currentReview.rating ? "#FFD700" : "#E5E7EB"}
                    color={i < currentReview.rating ? "#FFD700" : "#E5E7EB"}
                    size={18} 
                    className="mr-1"
                  />
                ))}
              </div>
              
              <p className="text-theme-body text-lg italic mb-2">
                &ldquo;{currentReview?.content || ''}&rdquo;
              </p>
            </div>
          </div>
          
          {/* Next Button */}
          <button 
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Next review"
          >
            <ChevronRight size={24} className="text-primary" />
          </button>
        </div>
        
        {/* Dots for Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {reviewsData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="text-center mt-8">
          {reviewsContent?.button_link_1?.url && (
            <Link 
              href={reviewsContent.button_link_1.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-secondary hover:bg-theme-bg/30 text-primary font-medium py-2 px-6 rounded-full text-sm transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {reviewsContent.button_link_1.text || ''}
            </Link>
          )}
          
          {/* Add Review Link */}
          {reviewsContent?.button_link_2?.url && (
            <div className="mt-8 text-center">
            <p className="text-primary text-lg mb-3">
              {reviewsContent.button_link_2?.content || ''}
            </p>
            <a 
              href={reviewsContent.button_link_2.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-primary font-medium py-2 px-4 border border-primary rounded transition-colors"
            >
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
                {reviewsContent.button_link_2.text || ''}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
