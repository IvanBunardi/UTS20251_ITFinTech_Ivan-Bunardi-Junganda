// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com', 'tse3.mm.bing.net',], // tambahkan domain gambar eksternal
  },
}

module.exports = nextConfig;
