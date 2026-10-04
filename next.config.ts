import type { NextConfig } from "next";

// On GitHub Pages the site lives under /<repo>/, so the workflow sets
// NEXT_PUBLIC_BASE_PATH=/trip-to-asia-md. Locally it stays at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    // Photos are hot-linked from Wikimedia and served as-is, which also
    // keeps the site deployable as a static export.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

export default nextConfig;
