import React from "react";
import Link from "next/link";

export interface RelatedPolicy {
  slug: string;
  title?: string;
}

export interface RelatedPolicyPagesProps {
  relatedPolicyPages?: RelatedPolicy[] | null;
}

const RelatedPolicyPages: React.FC<RelatedPolicyPagesProps> = ({ relatedPolicyPages }) => {
  if (!relatedPolicyPages || relatedPolicyPages.length === 0) {
    return null;
  }


  return (
    <div className="bg-card-bg border border-card-border rounded-xl shadow-lg p-8 mb-8">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-primary text-center">
          Related Policy Pages
        </h2>
        <div className="h-1 w-24 bg-accent/60 rounded mt-3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {relatedPolicyPages.map((policy) => {
          return (
            <Link
              key={policy.slug}
              href={policy.slug}
              className="bg-card-bg rounded-xl p-5 text-center shadow-md border border-card-border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center h-full"
            >
              <h3 className="text-lg font-heading font-semibold text-primary mb-2">
                {policy.title || policy.slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Policy'}
              </h3>
              <div className="mt-auto flex items-center text-accent/90 font-medium text-sm">
                <span>Learn More</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedPolicyPages;
