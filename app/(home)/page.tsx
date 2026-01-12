import React from 'react';
import { Metadata } from 'next';
import HeroSection from '@/components/home-page/HeroSection';
import IntroSection from '@/components/home-page/IntroSection';
import LocationPoliciesSection from '@/components/home-page/LocationPoliciesSection';
import Testimonials from '@/components/home-page/TestimonialsWrapper';
import HomeCTA from '@/components/home-page/HomeCTA';
import FAQPreview from '@/components/home-page/FAQPreviewWrapper';
import InsuranceCareersSection from '@/components/home-page/InsuranceCareersSection';
import { getClientData } from '@/lib/client';

// Page-specific metadata overrides - inherits from layout.tsx
export async function generateMetadata(): Promise<Metadata> {
  const clientMetadata = await getClientData();
  const agencyName = clientMetadata?.agency_name || "";
  const url = clientMetadata?.client_website?.canonical_url || "";
  const city = clientMetadata?.city || "";

  return {
    title: `${agencyName} | Your Trusted ${city} Insurance Partner`,

    // Homepage-specific description (under 150 characters)
    description: `${agencyName} is a trusted insurance agency in ${city}, ${clientMetadata?.state || ''}. Auto, home, life & business coverage.`,

    // Page-specific OpenGraph overrides
    openGraph: {
      title: `${agencyName} | ${city}'s Trusted Insurance Partner`,
      description: `Protect what matters most with personalized insurance solutions. Serving ${city} families and businesses with auto, home, life, and commercial coverage.`,
      url: url,
    },

    // Page-specific Twitter/X overrides
    twitter: {
      title: `${agencyName} | ${city} Insurance Expert`,
      description: `Personalized insurance protection for ${city} families and businesses. Auto, home, life & commercial insurance.`,
    },
  };
}


export default function Home() {
  return (
    <div className="home-content">
      <HeroSection />
      <IntroSection />
      <LocationPoliciesSection />
      <Testimonials />
      <HomeCTA />
      <FAQPreview />
      <InsuranceCareersSection />
    </div>
  );
}

export const revalidate = 3600;
