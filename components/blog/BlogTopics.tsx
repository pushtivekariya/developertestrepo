'use client'

import Image from 'next/image';
import { Tag, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

export default function BlogTopics({ topics, basePath = '/blog' }: { topics: any[]; basePath?: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 10;

  // Calculate pagination
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(topics.length / topicsPerPage);

  // Change page handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {currentTopics.map((topic: any) => (
            <div key={topic.id} className="bg-card-bg rounded-xl shadow-lg border border-card-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full">
              <div className="w-full aspect-square bg-gray-200 relative" style={{ maxWidth: 1024, maxHeight: 1024 }}>
                {/* Use Next.js Image component for optimized loading if topic.image_url exists */}
                {topic.image_url ? (
                  <Image
                    src={topic.image_url}
                    alt={topic.name}
                    width={1024}
                    height={1024}
                    className="object-cover w-full h-full"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200">
                    <Tag className="h-8 w-8 mr-2 text-gray-400" />
                    <span>Topic Image: {topic.name}</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#004080] bg-[#A7D8DE]/30 px-2 py-1 rounded">
                    Insurance
                  </span>
                  <div className="text-sm text-theme-body flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{topic.postCount} {topic.postCount === 1 ? 'Article' : 'Articles'}</span>
                  </div>
                </div>
                <h2 className="text-xl font-heading font-semibold text-primary mb-2 hover:text-[#003366]">
                  <Link href={`${basePath}/${topic.slug}`}>
                    {topic.name}
                  </Link>
                </h2>
                <p className="text-theme-body leading-relaxed mb-4 flex-grow">
                  {topic.description}
                </p>
                <div className="flex justify-end items-center mt-auto">
                  <Link
                    href={`${basePath}/${topic.slug}`}
                    className="flex items-center text-accent/90 font-medium text-sm hover:text-accent"
                  >
                    View Articles
                    <Image
                      src="/Images/icons/arrow-right.svg"
                      alt="Arrow Right"
                      width={14}
                      height={14}
                      className="ml-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* If no topics are available */}
          {currentTopics.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-xl text-theme-body">No blog topics available at this time. Please check back soon.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-accent text-accent-foreground hover:bg-[#003366] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                aria-label="Previous page"
              >
                &laquo;
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${currentPage === index + 1
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'bg-theme-bg/40 text-primary hover:bg-theme-bg/60 border border-secondary'
                    }`}
                  aria-label={`Page ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-accent text-accent-foreground hover:bg-[#003366] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                aria-label="Next page"
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  )
}