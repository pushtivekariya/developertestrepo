import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';

interface TeamMemberTemplateProps {
  children?: ReactNode;
  teamMember: {
    name: string;
    position: string;
    excerpt: string;
    imagePath: string;
    email?: string;
    phone?: string;
    specialties?: string[];
    hide_email_in_website?: boolean;
  };
  basePath?: string;
}

export default function TeamMemberTemplate({
  children,
  teamMember,
  basePath = '/our-team',
}: TeamMemberTemplateProps) {
  return (

    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-20 bg-theme-bg/80 relative w-full">
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-60 h-80 relative overflow-hidden border-4 border-white shadow-xl">
              <Image
                src={teamMember.imagePath || "/Images/team/placeholder.jpg"}
                alt={teamMember.name}
                fill
                className="object-cover object-center"
                sizes="240px"
                quality={95}
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-2">
                {teamMember.name}
              </h1>
              <div className="h-1 w-16 bg-accent/70 rounded mx-auto md:mx-0 my-3"></div>
              <p className="text-theme-body text-xl md:text-2xl font-medium">
                {teamMember.position}
              </p>
            </div>
          </div>
        </div>

        <Divider position="bottom" />
      </section>

      {/* Navigation Breadcrumb */}
      <div className="bg-white pt-8 pb-4">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <Link href={basePath} className="inline-flex items-center text-secondary hover:text-accent transition-colors">
            <Image src="/Images/icons/arrow-left.svg" alt="Arrow Left" width={16} height={16} className="mr-2" />
            <span>Back to Team</span>
          </Link>
        </div>
      </div>

      {/* Team Member Content */}
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            {/* Bio Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-heading font-bold text-primary mb-6">
                About {teamMember.name}
              </h2>
              <div className="prose prose-lg max-w-none text-theme-body">
                {children}
              </div>
            </div>

            {/* Contact Information */}
            {(teamMember.email || teamMember.phone) && (
              <div className="mb-10">
                <h3 className="text-xl font-heading font-bold text-primary mb-4">
                  Contact Information
                </h3>
                <div className="flex flex-col space-y-3">
                  {teamMember.email && (
                    <div className="flex items-center">
                      <Mail size={20} className="mr-3 text-secondary" />
                      <a
                        href={`mailto:${teamMember.email}`}
                        className="text-theme-body hover:text-accent transition-colors"
                      >
                        {teamMember.hide_email_in_website ? 'Email Hidden' : teamMember.email}
                      </a>
                    </div>
                  )}
                  {teamMember.phone && (
                    <div className="flex items-center">
                      <Phone size={20} className="mr-3 text-secondary" />
                      <a
                        href={`tel:${teamMember.phone}`}
                        className="text-theme-body hover:text-accent transition-colors"
                      >
                        {teamMember.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialties */}
            {teamMember.specialties && teamMember.specialties.length > 0 && (
              <div>
                <h3 className="text-xl font-heading font-bold text-primary mb-4">
                  Areas of Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teamMember.specialties.map((specialty, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-secondary/30 text-primary text-sm font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-secondary/10 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-heading font-bold text-primary mb-4">
              Have Questions? Get in Touch
            </h3>
            <p className="text-theme-body mb-6 max-w-2xl mx-auto">
              Contact {teamMember.name} directly or schedule a consultation to discuss your insurance needs.
            </p>
            <Link
              href={basePath.includes('/locations/') ? `${basePath.split('/our-team')[0]}/contact` : '/contact'}
              className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:shadow-lg"
            >
              Contact {teamMember.name.split(' ')[0]}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
