'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BackToTop () {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

   // Monitor scroll position for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-accent text-accent-foreground p-3 rounded-full shadow-lg hover:bg-accent/80 transition-all duration-300 animate-fade-in z-50"
          aria-label="Back to top"
        >
          <Image src="/Images/icons/narrow-up.svg" alt="Arrow Up" width={20} height={20} />
        </button>
      )}
    </>
  );
};