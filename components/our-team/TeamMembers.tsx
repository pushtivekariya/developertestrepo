import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getTeamMembers } from 'lib/team';
import { getClientData } from '@/lib/client';
import { getWebsiteData } from '@/lib/website';
import { getBusinessInfo } from '@/lib/business-info';
import { getClientPrimaryLocation } from '@/lib/utils';

interface TeamMembersProps {
  locationId?: string | null;
  basePath?: string;
}

export default async function TeamMembers({ locationId, basePath = '/our-team' }: TeamMembersProps = {} as TeamMembersProps) {
  // If no locationId provided, use primary location
  const resolvedLocationId = locationId ?? (await getClientPrimaryLocation())?.id;
  const [teamMembers, clientData, websiteData, businessInfo] = await Promise.all([
    getTeamMembers(resolvedLocationId),
    getClientData(),
    getWebsiteData(),
    getBusinessInfo(),
  ]);

  const canonicalUrl = clientData?.client_website?.canonical_url || '';
  const pageUrl = canonicalUrl ? `${canonicalUrl}${basePath}` : basePath;
  const agencyName = clientData?.agency_name || 'Our Team';
  const location = websiteData?.client_locations;

  const ldJsonSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `${agencyName} Team`,
    description: businessInfo.about_short || `Meet the dedicated insurance professionals at ${agencyName}.`,
    url: pageUrl,
    mainEntity: {
      '@type': 'ProfessionalService',
      name: agencyName,
      url: canonicalUrl || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: location?.address_line_1 || clientData?.address || '',
        addressLocality: location?.city || clientData?.city || '',
        addressRegion: location?.state || clientData?.state || '',
        postalCode: location?.zip || clientData?.zip || '',
        addressCountry: 'US',
      },
    },
  };

  return (
    <>
      <div className="container mx-auto px-4 max-w-screen-xl">
        {/* Team Members Grid */}
        {teamMembers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-5xl">

            {teamMembers.map((member, index) => (
              <Link 
                key={index}
                href={`${basePath}/${member.slug}`}
                className="block h-full"
              >
                <div className="bg-white shadow-md overflow-hidden border border-secondary/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="w-60 h-80 relative overflow-hidden mx-auto">
                    <Image 
                      src={member.imagePath || "/Images/team/placeholder.jpg"} 
                      alt={member.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={95}
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-heading font-bold text-primary mb-1">
                      {member.name}
                    </h3>
                    <p className="text-accent font-medium mb-3">
                      {member.position}
                    </p>
                    <div className="h-0.5 w-12 bg-secondary/30 mb-4"></div>
                    <p className="text-theme-body mb-4 flex-grow line-clamp-3">
                      {member.excerpt}
                    </p>
                    <div className="mt-auto">
                      <button className="text-secondary font-medium flex items-center hover:text-accent transition-colors">
                        Learn More <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No team members found</p>
          </div>
        )}

        {/* Team Values Section */}
        <div className="mt-16 mb-10 bg-theme-bg/50 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6 text-center">
            Our Commitment To You
            <div className="h-1 w-24 bg-accent/60 rounded mx-auto mt-3"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Personal Attention</h3>
              <p className="text-theme-body">We take the time to understand your unique needs and concerns.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Expert Guidance</h3>
              <p className="text-theme-body">Our experienced team provides knowledgeable advice for informed decisions.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Dedicated Service</h3>
              <p className="text-theme-body">We&apos;re here for you with responsive support when you need us most.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-secondary/10 p-8 rounded-2xl shadow-md">
          <h3 className="text-2xl font-heading font-bold text-primary mb-4">
            Ready to Work with Our Team?
          </h3>
          <p className="text-theme-body mb-6 max-w-2xl mx-auto">
            Contact our team of dedicated insurance professionals today for personalized service and solutions.
          </p>
          <Link href={basePath.includes('/locations/') ? `${basePath.split('/our-team')[0]}/contact` : '/contact'}>
            <button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg">
              Contact Us Today
            </button>
          </Link>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
    </>
  );
}

