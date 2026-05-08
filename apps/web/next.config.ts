import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, "..//.."),
  },
  allowedDevOrigins: ['equiprent.me'],
};

export default nextConfig;
