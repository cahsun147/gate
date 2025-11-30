/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahan dari Arwes (direkomendasikan)
  reactStrictMode: false,
  transpilePackages: ['@arwes/react', '@arwes/core', 'iconoir-react'],

  // Di bawah ini adalah konfigurasi PENTING Anda yang sudah ada
  // (JANGAN DIHAPUS)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/api/:path*'
            : '/api/:path*',
      },
    ];
  }
};

module.exports = nextConfig;