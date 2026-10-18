import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@ask/db'],
  // Eski Railway adresi kalıcı olarak yeni alan adına
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'web-production-06ee9.up.railway.app' }],
      destination: 'https://robotix.macademia.com.tr/:path*',
      permanent: true,
    }]
  },
}

export default nextConfig
