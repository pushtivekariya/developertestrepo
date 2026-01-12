import { ReactNode } from 'react';
import { Users } from 'lucide-react';
import { getClientData } from '@/lib/client';
import { Divider } from '@/components/ui/Divider';

interface TeamPageTemplateProps {
  children: ReactNode;
  heroSection: {
    heading: string;
    subheading?: string;
  };
}

export default async function TeamPageTemplate({
  children,
  heroSection,
}: TeamPageTemplateProps) {
  const clientData = await getClientData();

  // Format city: capitalize first letter, lowercase rest, handle null/undefined
  const clientCity = clientData?.city 
    ? clientData.city.charAt(0).toUpperCase() + clientData.city.slice(1).toLowerCase()
    : 'your city';
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            {heroSection.heading}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto" style={{ color: 'var(--hero-text-secondary)' }}>
            Dedicated insurance professionals serving {clientCity} and the surrounding area.
          </p>
        </div>

        <Divider position="bottom" />
      </section>

      {/* Standard Introduction for team page */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-primary rounded-full px-4 py-2 text-sm font-medium mb-4 shadow-sm">
              <Users size={16} className="text-primary" />
              <span>Our Dedicated Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4 relative">
              Experienced Insurance Professionals
              <div className="h-1 w-24 bg-accent/60 rounded mx-auto mt-3"></div>
            </h2>
            <p className="text-theme-body text-lg max-w-3xl mx-auto leading-relaxed mb-6">
              Get to know the faces behind {clientData?.agency_name || ''}. Our team of experienced
              professionals is dedicated to providing personalized insurance solutions for
              {clientCity ? ` ${clientCity}` : ''} and the surrounding area.
            </p>
          </div>
        </div>
      </div>

      {/* Team Content */}
      <div className="pb-16 bg-white">
        {children}
      </div>
    </main>
  );
}
