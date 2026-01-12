/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'railway.app'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  output: 'standalone',
  // Allow subdomain requests in development (espora.localhost, demo.localhost, etc.)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
  // Allow dev requests from subdomains
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://espora.localhost:3000',
    'http://*.localhost:3000',
  ],
}

module.exports = nextConfig
