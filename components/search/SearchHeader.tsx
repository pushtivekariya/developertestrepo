'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchHeader () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchHeaderContent />
    </Suspense>
  );
}

function SearchHeaderContent () {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  return (
    <header>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6 text-center">
        {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Our Site'}
      </h1>
    </header>
  );
};