'use client';

import { ChevronUp, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import React, { useState } from 'react';

export default function FAQItems({ items }) {
  const [openFaqs, setOpenFaqs] = useState<Record<string, number[]>>({});
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, Record<number, 'helpful' | 'not-helpful' | null>>>({});

  const toggleFaq = (policyId: string, index: number) => {
    setOpenFaqs(prev => {
      const policyFaqs = prev[policyId] || [];
      return {
        ...prev,
        [policyId]: policyFaqs.includes(index)
          ? policyFaqs.filter(i => i !== index)
          : [...policyFaqs, index]
      };
    });
  };

  const isOpen = (policyId: string, index: number) => {
    return (openFaqs[policyId] || []).includes(index);
  };

  const recordFeedback = (policyId: string, faqIndex: number, isHelpful: boolean) => {
    setHelpfulFeedback(prev => ({
      ...prev,
      [policyId]: {
        ...(prev[policyId] || {}),
        [faqIndex]: isHelpful ? 'helpful' : 'not-helpful'
      }
    }));
  };

  const getFeedback = (policyId: string, faqIndex: number) => {
    return helpfulFeedback[policyId]?.[faqIndex] || null;
  };

  return (
    <div className="space-y-12">
      {items.map(policy => (
        <div
          key={policy.id}
          id={policy.id}
          className="max-w-3xl mx-auto bg-card-bg rounded-xl shadow-md overflow-hidden border border-card-border"
        >
          <div className="bg-primary/10 p-4 flex items-center space-x-3">
            {policy.icon}
            <h2 className="text-2xl font-heading font-bold text-primary">
              {policy.name}
            </h2>
          </div>

          <div className="divide-y divide-secondary/20">
            {policy.faqs.map((faq, index) => (
              <div key={index} className="transition-all duration-300">
                <button
                  onClick={() => toggleFaq(policy.id, index)}
                  className={`w-full text-left p-4 flex justify-between items-center transition-colors ${isOpen(policy.id, index) ? 'bg-theme-bg/30' : 'hover:bg-gray-50'
                    }`}
                  aria-expanded={isOpen(policy.id, index)}
                >
                  <span className="font-medium text-lg text-primary">{faq.question}</span>
                  {isOpen(policy.id, index) ?
                    <ChevronUp className="flex-shrink-0 text-primary" /> :
                    <ChevronDown className="flex-shrink-0 text-primary" />
                  }
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen(policy.id, index) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="p-4 bg-white text-theme-body leading-relaxed text-md">
                    <div 
                      className="prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                      dangerouslySetInnerHTML={{ __html: faq.answer }} 
                    />

                    {/* Feedback buttons */}
                    <div className="mt-4 flex items-center space-x-4 pt-2 border-t border-secondary/20">
                      <span className="text-sm text-theme-body">Was this helpful?</span>

                      <button
                        onClick={() => recordFeedback(policy.id, index, true)}
                        disabled={getFeedback(policy.id, index) !== null}
                        className={`inline-flex items-center space-x-1 p-1 rounded-md ${getFeedback(policy.id, index) === 'helpful'
                            ? 'bg-green-100 text-green-700'
                            : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        aria-label="Mark as helpful"
                      >
                        <ThumbsUp size={16} />
                        <span className="text-sm">Yes</span>
                      </button>

                      <button
                        onClick={() => recordFeedback(policy.id, index, false)}
                        disabled={getFeedback(policy.id, index) !== null}
                        className={`inline-flex items-center space-x-1 p-1 rounded-md ${getFeedback(policy.id, index) === 'not-helpful'
                            ? 'bg-red-100 text-red-700'
                            : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        aria-label="Mark as not helpful"
                      >
                        <ThumbsDown size={16} />
                        <span className="text-sm">No</span>
                      </button>

                      {getFeedback(policy.id, index) && (
                        <span className="text-sm text-green-700 animate-fade-in">
                          Thank you for your feedback!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};