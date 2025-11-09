/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['storage.googleapis.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;

