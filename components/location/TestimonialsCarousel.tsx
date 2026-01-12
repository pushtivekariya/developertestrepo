'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: string;
  review_text: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const goToPrev = () => {
    setActiveIndex((activeIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((activeIndex + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || testimonials.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted, testimonials.length]);

  // Safety check for empty testimonials - must be after hooks
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="py-16 px-4 bg-theme-bg">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2">
            What Our Clients Say
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
            <span className="ml-2 text-lg font-medium">5.0 out of 5</span>
          </div>
        </div>

        <div className="relative mb-10 max-w-3xl mx-auto">
          <button 
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft size={24} className="text-primary" />
          </button>
          
          <div className="overflow-hidden px-12">
            <div 
              key={activeIndex}
              className="bg-card-bg rounded-lg shadow-md p-8 border border-card-border/30 mx-auto transition-opacity duration-500"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary mr-3">
                  {currentTestimonial.name.trim().charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-primary text-lg">{currentTestimonial.name.trim()}</h4>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    fill="#FFD700"
                    color="#FFD700"
                    size={18} 
                    className="mr-1"
                  />
                ))}
              </div>
              
              <p className="text-theme-body text-lg italic mb-2">
                &ldquo;{currentTestimonial.review_text}&rdquo;
              </p>
            </div>
          </div>
          
          <button 
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Next review"
          >
            <ChevronRight size={24} className="text-primary" />
          </button>
        </div>
        
        <div className="flex justify-center gap-2 mb-8">
          {testimonials.map((_, index) => (
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
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
