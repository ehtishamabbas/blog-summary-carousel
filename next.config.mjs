/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optional: Add other Next.js configurations here if needed
  // For example, to handle images from external domains for static export:
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
