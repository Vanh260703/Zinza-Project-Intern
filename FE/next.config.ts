import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow serving images from mock-assets
  images: {
    unoptimized: true,
  },
}

export default nextConfig
