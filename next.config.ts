import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/live': ['./lib/live/**/*.json', './lib/live/probability/*.ts','./lib/live/updates/*.ts', './lib/sim/*.ts', './lib/sim/precomputedOdds.json', './scripts/generate-live-odds.mjs', './scripts/validate-live-odds.mjs', './scripts/generate-live-round2.mjs', './scripts/generate-live-round3.mjs'],
    '/teams/*': ['./.team-stats-release/data.json'],
    '/teams/*/*': ['./.team-stats-release/data.json'],
  },
};

export default nextConfig;
