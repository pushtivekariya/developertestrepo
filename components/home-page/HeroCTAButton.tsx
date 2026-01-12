'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LocationPickerPopup from '@/components/ui/LocationPickerPopup';

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
}

interface HeroCTAButtonProps {
  isMultiLocation: boolean;
  locations: Location[];
}

const HeroCTAButton: React.FC<HeroCTAButtonProps> = ({
  isMultiLocation,
  locations
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (!isMultiLocation) {
    return (
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        Contact Us
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        Find a Location
      </button>

      <LocationPickerPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        locations={locations}
      />
    </>
  );
};

export default HeroCTAButton;
