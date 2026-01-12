/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  trailingSlash: false, // ensures URLs like /privacy are served without trailing slash
  reactStrictMode: true,
  
  // App Router is enabled by default in Next.js 15.3.0+

  
  // ESLint disabled during builds (re-enable after fixing remaining issues)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization settings
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'placeholdimg.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placekitten.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'bxpxxyxctdsyucqpwxrz.supabase.co' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Responsive image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Image sizes for srcset
    formats: ['image/webp'], // Enable WebP format for better compression
  },
  
  // Add redirects for handling legacy routes
  async redirects() {
    return [
      {
        source: '/services',
        destination: '/policies',
        permanent: true, // This returns a 308 status code (permanent redirect)
      },
      // About page variations
      {
        source: '/about-us/:path*',
        destination: '/about',
        permanent: true,
      },
      // Fix duplicate/erroneous glossary index route
      {
        source: '/glossary/index',
        destination: '/glossary',
        permanent: true,
      },
    ];
  },
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
          },
        ],
      },
    ];
  },
  
  // Environment variables - all site-specific values come from Supabase via NEXT_PUBLIC_CLIENT_ID
  env: {},
};

module.exports = nextConfig;
