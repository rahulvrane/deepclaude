import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Changed from 'standalone' to 'export'
  distDir: 'dist',   // This will output to './dist' instead of '.next'
  images: {
    unoptimized: true, // Required for 'export'
  },
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
  }
}

export default nextConfig;