/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['storage.googleapis.com', 'tse3.mm.bing.net'],
  },

  eslint: {
    // ⛔ Abaikan semua error/warning ESLint saat build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig;
