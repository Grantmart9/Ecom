import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["drizzle-orm", "postgres"],
  transpilePackages: ["@mui/material", "@mui/system", "@mui/icons-material"],
  reactStrictMode: true,
};

export default nextConfig;
