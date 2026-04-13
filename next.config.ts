import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/order-dashboard',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
