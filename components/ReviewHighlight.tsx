import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';

interface Review {
  name: string;
  location: string;
  rating: number;
  quote: string;
}

interface ReviewHighlightProps {
  reviews?: Review[];
}

const ReviewHighlight: React.FC<ReviewHighlightProps> = ({ reviews = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const nextReview = React.useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, reviews.length]);
  
  const prevReview = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  useEffect(() => {
    if (reviews.length === 0) return;
    
    const interval = setInterval(() => {
      nextReview();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [nextReview, reviews.length]);

  // If no reviews provided, don't render the component
  if (reviews.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 bg-theme-bg/80 relative w-full">
      <Divider position="top" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <div className="inline-block bg-secondary/30 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="testimonial-card">
            <div className="text-theme-bg mb-6">
              <Quote size={40} />
            </div>
            
            <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-theme-body text-xl md:text-2xl italic mb-8 font-light leading-relaxed">
                &ldquo;{reviews[currentIndex].quote}&rdquo;
              </p>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <p className="text-primary font-heading font-bold text-lg">
                    {reviews[currentIndex].name} – {reviews[currentIndex].location}
                  </p>
                  <div className="flex items-center mt-2">
                    {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={18} className="text-accent fill-accent mr-1" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center mt-4 md:mt-0">
                  <button 
                    onClick={prevReview}
                    className="w-10 h-10 rounded-full bg-secondary/20 text-primary hover:bg-secondary/30 flex items-center justify-center mr-2 transition-colors"
                    disabled={isAnimating}
                    aria-label="Previous review"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextReview}
                    className="w-10 h-10 rounded-full bg-secondary/20 text-primary hover:bg-secondary/30 flex items-center justify-center transition-colors"
                    disabled={isAnimating}
                    aria-label="Next review"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-secondary w-5' : 'bg-secondary/30'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Divider position="bottom" />
    </section>
  );
};

export default ReviewHighlight;
