import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  basePath: "/auth-ui",
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default config;
