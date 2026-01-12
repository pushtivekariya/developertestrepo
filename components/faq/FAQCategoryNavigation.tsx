
'use client';

import React from 'react';

export default function FAQCategoryNavigation ({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {items.map((category: any) => (
        <button
          key={category.id}
          onClick={() => document.getElementById(category.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="inline-flex items-center gap-2 bg-white py-2 px-4 rounded-full shadow-sm border border-secondary text-primary font-medium hover:bg-secondary/20 transition-colors"
        >
          {category.icon}
          {category.name}
        </button>
      ))}
    </div>
  );
};