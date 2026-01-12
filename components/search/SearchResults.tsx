'use client';

import { Search, HomeIcon, User, Shield, FileText, FileQuestion, Mail, Tag, Link } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SearchResults () {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Simulate search API call with setTimeout
    const timeoutId = setTimeout(() => {
      // Initialize empty results since mock data is removed
      const filteredResults = [];
      setResults(filteredResults);
      setIsLoading(false);
    }, 500); // Simulate a short delay

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (isLoading) {
    return (
      <div className="my-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-theme-body">Searching...</p>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="my-12 text-center">
        <div className="bg-gray-100 rounded-lg p-8 max-w-2xl mx-auto">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">No results found</h2>
          <p className="text-theme-body mb-6">
            We couldn&apos;t find any content matching your search for &ldquo;{query}&rdquo;.
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <p className="font-medium text-primary">Suggestions:</p>
            <ul className="list-disc list-inside text-theme-body space-y-1">
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Try different keywords</li>
              <li>Browse our site using the navigation menu</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'home':
        return <HomeIcon className="h-5 w-5" />;
      case 'about':
        return <User className="h-5 w-5" />;
      case 'policies':
        return <Shield className="h-5 w-5" />;
      case 'blog':
        return <FileText className="h-5 w-5" />;
      case 'faq':
        return <FileQuestion className="h-5 w-5" />;
      case 'contact':
        return <Mail className="h-5 w-5" />;
      case 'agents':
        return <User className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <div className="my-12">
      {results.length > 0 && (
        <p className="text-theme-body mb-8 text-center">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="space-y-6">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/30 text-primary mr-3">
                {getCategoryIcon(result.category)}
              </span>
              <span className="text-sm font-medium text-accent">{result.category}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-primary mb-2 hover:text-accent transition-colors">
              <Link href={result.url}>{result.title}</Link>
            </h2>
            <p className="text-theme-body mb-4">{result.excerpt}</p>
            <Link
              href={result.url}
              className="text-primary hover:text-accent font-medium transition-colors inline-flex items-center"
            >
              View {result.type === 'blog' ? 'Article' : 'Page'}
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};