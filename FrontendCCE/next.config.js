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
  output: 'standalone'
}

module.exports = nextConfig
