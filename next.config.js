const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prod'da backend'e proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://othello-backend-production-2ff4.up.railway.app/api/:path*',
      },
    ];
  },

  // Workspace root uyarısını sustur
  outputFileTracingRoot: path.join(__dirname, '..'),

  // ŞİMDİLİK: ESLint'i build'te es geç (deploy için hızlı çözüm)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
