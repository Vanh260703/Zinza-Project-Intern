import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Enable instrumentation hook (warms up mock DB on server start)
  instrumentationHook: true,
}

export default nextConfig
