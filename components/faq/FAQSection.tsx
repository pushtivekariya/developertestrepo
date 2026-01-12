import React from 'react';

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs, title = 'Frequently Asked Questions' }) => (
  <div className="bg-gray-50 rounded-lg p-6 shadow-sm mt-10">
    <h4 className="text-2xl font-heading font-bold text-primary mb-4">{title}</h4>
    {faqs.map((faq, idx) => (
      <div className="mb-6" key={idx}>
        <h5 className="text-xl font-heading font-semibold text-primary mb-2">{faq.question}</h5>
        <div className="text-theme-body leading-relaxed">{faq.answer}</div>
      </div>
    ))}
  </div>
);

export default FAQSection;
