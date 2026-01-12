'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Divider } from '@/components/ui/Divider';
import { BadgeSmall } from '@/components/ui/Badge';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQContent {
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
  faqs: {
    type: string;
    items: FAQItem[];
  };
}

interface FAQPreviewProps {
  faqContent: FAQContent;
}

const FAQPreview: React.FC<FAQPreviewProps> = ({ faqContent }) => {
  const [openIndex, setOpenIndex] = useState(-1);
  const faqs = faqContent?.faqs?.items || [];

  // Safety check for empty FAQs
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-16 bg-theme-bg-alt relative w-full">
      <Divider position="top" />
      
      <div className="container mx-auto px-4 py-6 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-in">
          <BadgeSmall className="mb-4">
            {faqContent?.tagline?.content || ''}
          </BadgeSmall>
          <h2 className="section-title mb-4">{faqContent?.subtitle?.content || ''}</h2>
          <p className="text-theme-body text-lg">
            {faqContent?.description?.content || ''}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="mb-4 border border-card-border/30 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-secondary/10 transition-colors text-left"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
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
                  id={`faq-answer-${index}`}
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

export { FAQPreview };
