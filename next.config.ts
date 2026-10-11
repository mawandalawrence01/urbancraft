import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Admin uploads go to Vercel Blob, which serves them from a per-store
      // subdomain. Without this every photo the workshop uploads renders as a
      // broken image: next/image refuses any host that is not listed here.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
