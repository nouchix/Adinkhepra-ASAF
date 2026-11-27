import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
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
