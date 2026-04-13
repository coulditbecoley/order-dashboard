import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use default server mode for dynamic BigCommerce API calls
  // output: 'export' is disabled to support dynamic routes
  // Note: basePath removed for Vercel (no basePath needed at root domain)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
