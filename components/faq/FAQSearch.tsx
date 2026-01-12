'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function FAQSearch({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ categoryId: string, faqIndex: number, question: string }>>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{ categoryId: string, faqIndex: number, question: string }> = [];

    items.forEach(category => {
      category.faqs.forEach((faq, index) => {
        if (
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term)
        ) {
          results.push({
            categoryId: category.id,
            faqIndex: index,
            question: faq.question
          });
        }
      });
    });

    setSearchResults(results);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 pt-12">
      <div className="relative">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full py-3 px-4 pl-12 rounded-full border border-secondary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-body" size={20} />
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md border border-secondary animate-fade-in">
          <h3 className="font-bold text-primary mb-2">Search Results:</h3>
          <ul className="divide-y divide-secondary/30">
            {searchResults.map((result, idx) => (
              <li key={idx} className="py-2">
                <button
                  onClick={() => {
                    document.getElementById(result.categoryId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left w-full text-primary hover:text-accent transition-colors"
                >
                  {result.question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
