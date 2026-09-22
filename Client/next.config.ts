import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental:{
    turbopackRustReactCompiler: true,
    turbopackFileSystemCacheForDev: true,
  }
};

export default nextConfig;
