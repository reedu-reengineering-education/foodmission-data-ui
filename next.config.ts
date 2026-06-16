import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No next/image usage; avoids Sharp at runtime. License CI uses `npm ci --omit=optional`.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
