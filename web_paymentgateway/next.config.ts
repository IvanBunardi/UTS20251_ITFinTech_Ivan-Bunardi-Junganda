const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com', 'tse3.mm.bing.net'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⛔ Abaikan semua error TypeScript saat build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
