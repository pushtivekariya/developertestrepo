'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';

interface SearchBarProps {
  variant?: 'header' | 'fullwidth';
  placeholder?: string;
  onClose?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  variant = 'header', 
  placeholder = 'Search the site...', 
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (onClose) onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.blur();
      if (onClose) onClose();
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };
  
  return (
    <form 
      onSubmit={handleSearchSubmit} 
      className={`relative ${variant === 'fullwidth' ? 'w-full' : 'w-full max-w-xs'}`}
    >
      <div
        className={`flex items-center bg-white overflow-hidden transition-all ${
          variant === 'header' 
            ? 'rounded-full border border-gray-300 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/50' 
            : 'rounded-lg border-2 border-primary focus-within:ring-2 focus-within:ring-primary/50'
        } ${isFocused ? 'shadow-md' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search"
          className={`w-full py-2 px-4 outline-none text-theme-body ${
            variant === 'fullwidth' ? 'text-lg py-3' : ''
          }`}
        />
        
        {searchQuery && (
          <button 
            type="button" 
            onClick={clearSearch}
            aria-label="Clear search"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <button 
          type="submit" 
          aria-label="Search"
          className={`p-2 flex items-center justify-center ${
            variant === 'header' 
              ? 'text-primary hover:text-accent' 
              : 'bg-accent text-accent-foreground hover:bg-[#003366] px-4'
          } transition-colors`}
        >
          <SearchIcon className={`${variant === 'header' ? 'h-5 w-5' : 'h-6 w-6'}`} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
