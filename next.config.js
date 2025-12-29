/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://thrive-pcos-backend.vercel.app',
  },
}

module.exports = nextConfig
