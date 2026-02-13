import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // mammoth uses Node.js Buffer internally
  serverExternalPackages: ['mammoth'],

  // CORS headers for scrape API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      },
    ]
  },
}

export default nextConfig
