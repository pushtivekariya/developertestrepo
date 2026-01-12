import React from 'react';
import { supabase } from '@/lib/supabase';
import GoogleReviews from './GoogleReviews';

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

interface ClientHomePageData {
  testimonials_section?: ReviewsContent;
}

async function getReviewsSection(): Promise<ReviewsContent | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not set');
    return null;
  }

  const query = supabase
    .from('client_home_page')
    .select('testimonials_section')
    .eq('client_id', clientId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching reviews section:', error);
    return null;
  }

  const reviewsData = (data as ClientHomePageData | null)?.testimonials_section;

  if (!reviewsData) {
    return null;
  }

  return reviewsData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function GoogleReviewsWrapper({ locationId }: { locationId?: string | null }) {
  const reviewsContent = await getReviewsSection();
  
  if (!reviewsContent) {
    return null;
  }

  return <GoogleReviews reviewsContent={reviewsContent} />;
}

