import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        { protocol: "https", hostname: "cdn.playadopt.me" },
        { protocol: "https", hostname: "images.roblox.com" },
      ],
  }
};

export default nextConfig;
