import { withContentlayer } from "next-contentlayer"
import createNextIntlPlugin from 'next-intl/plugin';

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: "en",
    domains: [
      {
        domain: 'refreak.com',
        defaultLocale: 'en',
        locales: ['en'],
      },
      {
        domain: 'refreak.ru',
        defaultLocale: 'ru',
        locales: ['ru'],
      },
    ],
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

export default withNextIntl(withContentlayer(nextConfig))
