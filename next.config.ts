import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image
  output: "standalone",
  // No next/image usage; avoids Sharp at runtime. License CI uses `npm ci --omit=optional`.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
