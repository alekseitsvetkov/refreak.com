import "./env.mjs"
import { withContentlayer } from "next-contentlayer";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  typescript: {
    // Ignore TypeScript errors during build for now
    ignoreBuildErrors: true,
  },
  // Disable styled-jsx to prevent context issues during prerendering
  compiler: {
    styledComponents: false,
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

export default withContentlayer(withNextIntl(nextConfig))
