import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App does not use next/image; omit Sharp (LGPL libvips) via optional deps + .npmrc
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
