import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.ASAF_HUB_URL || 'http://127.0.0.1:8443'}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
