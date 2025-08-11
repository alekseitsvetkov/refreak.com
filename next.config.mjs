import { withContentlayer } from "next-contentlayer"

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
    // These are all the locales you want to support in
    // your application
    locales: ['en', 'ru'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'en',
    // This is a list of locale domains and the default locale they
    // should handle (these are only required when setting up domain routing)
    // Note: subdomains must be included in the domain value to be matched e.g. "fr.example.com".
    domains: [
      {
        domain: 'refreak.com',
        defaultLocale: 'en',
      },
      {
        domain: 'refreak.ru',
        defaultLocale: 'ru',
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

export default withContentlayer(nextConfig)
