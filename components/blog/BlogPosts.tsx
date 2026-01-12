'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from "lucide-react";
import { useState } from "react";

export default function BlogPosts({ posts, topic, basePath = '/blog' }: { posts: any[]; topic: any; basePath?: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Debug: Log the posts data
  console.log('BlogPosts received:', { posts, topic });

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Change page handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.map(post => (
            <div key={post.id} className="bg-card-bg rounded-xl shadow-lg border border-card-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="w-full aspect-square bg-gray-200 relative" style={{ maxWidth: 1024, maxHeight: 1024 }}>
                {/* Use Next.js Image component for optimized loading if image_url exists */}
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    width={1024}
                    height={1024}
                    className="object-cover w-full h-full"
                    priority={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200">
                    <span>Blog Image: {post.title}</span>
                  </div>
                )}
                
                {/* Title Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                  <div className="text-center">
                    <h2 className="text-lg md:text-xl font-heading font-semibold text-white mb-2 leading-tight">
                      <Link href={`${basePath}/${topic.slug}/${post.slug}`} className="hover:text-accent/90 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-theme-body flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
                <p className="text-theme-body leading-relaxed mb-4">
                  {post.content_summary}
                </p>
                <div className="flex justify-end items-center">
                  <Link
                    href={`${basePath}/${topic.slug}/${post.slug}`}
                    className="flex items-center text-accent/90 font-medium text-sm hover:text-accent"
                  >
                    Read Article
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

          {/* If no posts are available */}
          {currentPosts.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-xl text-theme-body">No articles available in this topic yet. Please check back soon.</p>
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
  );
}
