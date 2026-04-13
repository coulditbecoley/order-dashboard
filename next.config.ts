import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default server mode for dynamic BigCommerce API calls
  // output: 'export' is disabled to support dynamic routes
  basePath: '/order-dashboard',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
