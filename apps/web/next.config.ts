import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@crossings/puzzle-schema'],
};

export default nextConfig;
