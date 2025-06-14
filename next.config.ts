import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Required for deploying to static hosts like Surge
  distDir: 'out',
};

export default nextConfig;
