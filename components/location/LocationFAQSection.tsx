'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';
import { BadgeSmall } from '@/components/ui/Badge';

interface QuestionItem {
  question: string;
  answer: string;
}

interface FaqSection {
  tagline?: string;
  subtitle?: string;
  description?: string;
  questions?: QuestionItem[];
  show_section?: boolean;
}

interface LocationFAQSectionProps {
  faqSection: FaqSection | null;
}

const LocationFAQSection: React.FC<LocationFAQSectionProps> = ({ faqSection }) => {
  const [openIndex, setOpenIndex] = useState(-1);
  
  // Don't render if no data
  if (!faqSection) {
    return null;
  }

  const questions = faqSection.questions || [];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-16 bg-theme-bg-alt relative w-full">
      <Divider position="top" />
      
      <div className="container mx-auto px-4 py-6 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-in">
          {faqSection.tagline && (
            <BadgeSmall className="mb-4">
              {faqSection.tagline}
            </BadgeSmall>
          )}
          {faqSection.subtitle && (
            <h2 className="section-title mb-4">{faqSection.subtitle}</h2>
          )}
          {faqSection.description && (
            <p className="text-theme-body text-lg">
              {faqSection.description}
            </p>
          )}
        </div>
        
        <div className="max-w-3xl mx-auto">
          {questions.map((faq, index) => (
            <div 
              key={index} 
              className="mb-4 border border-card-border/30 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-secondary/10 transition-colors text-left"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`location-faq-answer-${index}`}
              >
                <span className="font-medium text-primary">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={18} className="text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-primary flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div 
                  id={`location-faq-answer-${index}`}
                  className="bg-white px-4 py-4 transition-all duration-300 ease-in-out"
                  aria-hidden={false}
                >
                  <p className="text-theme-body text-sm">{faq.answer || ''}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationFAQSection;
