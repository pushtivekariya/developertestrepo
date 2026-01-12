"use client";

import { useState } from "react";
import Link from "next/link";

interface RelatedTermsSectionProps {
  terms: Array<{ slug: string; term: string }>;
}

export default function RelatedTermsSection({ terms }: RelatedTermsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="my-10">
      <div className="bg-theme-bg/40 rounded-xl shadow-lg p-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-2xl font-heading font-bold text-primary">
            Related Insurance Terms ({terms.length})
          </h2>
          <div className="ml-4 transform transition-transform duration-200">
            {isExpanded ? (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terms.map((term) => (
              <Link
                key={term.slug}
                href={`/glossary/${term.slug}`}
                className="bg-card-bg rounded-lg p-4 shadow-sm border border-card-border hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-secondary h-20 flex items-center justify-center text-center"
              >
                <span className="text-primary font-semibold hover:text-[#003366] line-clamp-2">
                  {term.term}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}