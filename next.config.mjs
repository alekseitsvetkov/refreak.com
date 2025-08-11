import { withContentlayer } from "next-contentlayer"
import createNextIntlPlugin from 'next-intl/plugin';

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  async rewrites() {
    return [
      {source: '/:locale(en|ru)', destination: '/'},
      {source: '/:locale(en|ru)/:path*', destination: '/:path*'}
    ];
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  webpack: (config, { isServer }) => {
    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    // Fallback for WebAssembly modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
    
    // Ignore WebAssembly modules that cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'markdown-wasm': false,
    }
    
    return config
  },
}

const withNextIntl = createNextIntlPlugin();

export default withContentlayer(withNextIntl(nextConfig))
