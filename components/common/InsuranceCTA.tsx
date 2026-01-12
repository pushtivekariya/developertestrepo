import React from 'react';
import Link from 'next/link';

interface InsuranceCTAProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  agencyName?: string;
}

export default function InsuranceCTA({
  title,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  agencyName,
}: InsuranceCTAProps) {
  const descriptionWithAgency = agencyName ? description.replace(/\{agency_name\}/g, agencyName) : description;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-screen-xl text-center">
        <h2 className="text-3xl font-heading font-bold text-primary mb-4">
          {title}
        </h2>
        <p className="text-theme-body mb-8 max-w-2xl mx-auto">
          {descriptionWithAgency}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryButtonHref}
            className="inline-block bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            {primaryButtonText}
          </Link>
          <Link
            href={secondaryButtonHref}
            className="inline-block border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            {secondaryButtonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
