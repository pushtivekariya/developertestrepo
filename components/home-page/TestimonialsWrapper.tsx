import React from 'react';
import { supabase } from '@/lib/supabase';
import Testimonials from './Testimonials';

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

interface GoogleReview {
  review_name: string;
  review_description: string;
}

interface ClientHomePageData {
  testimonials_section?: Partial<ReviewsContent>;
}

async function getTestimonialsSection(): Promise<ReviewsContent | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not set');
    return null;
  }

  // Fetch section header from client_home_page
  const { data: homePageData, error: homePageError } = await supabase
    .from('client_home_page')
    .select('testimonials_section')
    .eq('client_id', clientId)
    .maybeSingle();

  if (homePageError) {
    console.error('Error fetching testimonials section header:', homePageError);
  }

  // Fetch google_reviews from all locations for this client (source of truth from Review Posts)
  const { data: locationsData, error: locationsError } = await supabase
    .from('client_locations')
    .select('google_reviews')
    .eq('client_id', clientId);

  if (locationsError) {
    console.error('Error fetching location testimonials:', locationsError);
    return null;
  }

  // Aggregate all google_reviews from all locations
  const allTestimonials: ReviewItem[] = [];
  
  if (locationsData) {
    for (const location of locationsData) {
      const googleReviews = location.google_reviews as GoogleReview[] | null;
      if (googleReviews && Array.isArray(googleReviews)) {
        for (const review of googleReviews) {
          if (review.review_name && review.review_description) {
            allTestimonials.push({
              author: review.review_name,
              rating: 5, // Default to 5 stars
              content: review.review_description,
            });
          }
        }
      }
    }
  }

  // If no testimonials found, return null
  if (allTestimonials.length === 0) {
    return null;
  }

  // Get section header from home page data or use defaults
  const sectionHeader = (homePageData as ClientHomePageData | null)?.testimonials_section;

  return {
    tagline: sectionHeader?.tagline || { type: 'tagline', content: 'Testimonials' },
    subtitle: sectionHeader?.subtitle || { tag: 'h2', type: 'heading', content: 'What Our Customers Say' },
    description: sectionHeader?.description || { type: 'text', content: 'Based on real client reviews' },
    reviews: {
      type: 'reviews',
      items: allTestimonials,
    },
    button_link_1: sectionHeader?.button_link_1 || { url: '', text: '', type: 'button_link' },
    button_link_2: sectionHeader?.button_link_2 || { url: '', text: '', type: 'button_link', content: '' },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function TestimonialsWrapper({ locationId }: { locationId?: string | null }) {
  const reviewsContent = await getTestimonialsSection();
  
  if (!reviewsContent) {
    return null;
  }

  return <Testimonials reviewsContent={reviewsContent} />;
}
