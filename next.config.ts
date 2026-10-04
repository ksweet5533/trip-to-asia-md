import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos are hot-linked from Wikimedia and served as-is, so the site
    // can be deployed anywhere, including as a static export.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

export default nextConfig;
