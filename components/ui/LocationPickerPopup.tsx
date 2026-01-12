'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
}

interface LocationPickerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  title?: string;
  subtitle?: string;
}

const LocationPickerPopup: React.FC<LocationPickerPopupProps> = ({
  isOpen,
  onClose,
  locations,
  title = 'Select a Location',
  subtitle = 'Choose the location nearest to you'
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleLocationSelect = (slug: string) => {
    onClose();
    router.push(`/locations/${slug}`);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const popupContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{
        backgroundColor: `color-mix(in srgb, var(--popup-overlay-color) calc(var(--popup-overlay-opacity) * 100%), transparent)`,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div 
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--popup-bg-color)',
          borderColor: 'var(--popup-border-color)',
          borderWidth: 'var(--popup-border-width)',
          borderStyle: 'var(--popup-border-style)' as React.CSSProperties['borderStyle'],
          borderRadius: 'var(--popup-border-radius)',
        }}
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--popup-border-color)' }}>
          <div>
            <h2 id="popup-title" className="text-2xl font-heading font-bold text-primary">
              {title}
            </h2>
            <p className="text-theme-body mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close popup"
          >
            <X size={24} className="text-primary" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.location_slug)}
                className="flex items-start gap-4 p-4 rounded-lg border border-secondary hover:border-primary hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-lg">
                    {location.location_name}
                  </h3>
                  <p className="text-theme-body text-sm mt-1">
                    {location.city}, {location.state}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default LocationPickerPopup;
