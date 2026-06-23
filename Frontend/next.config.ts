import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { nextRuntime }) {
    // fs/path không tồn tại ở client và edge runtime → fallback false
    if (nextRuntime !== "nodejs") {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        path:   false,
        crypto: false,
        stream: false,
        os:     false,
      };
    }

    return config;
  },
};

export default nextConfig;
