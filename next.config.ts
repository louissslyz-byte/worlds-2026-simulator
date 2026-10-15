import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/teams/*': ['./.team-stats-release/data.json'],
    '/teams/*/*': ['./.team-stats-release/data.json'],
  },
};

export default nextConfig;
