import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: import.meta.dirname },
  // These files are read at run time, so Vercel must be told to ship them.
  outputFileTracingIncludes: { "/**": ["./content/**", "./config/aliases.csv"] },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default config;
