/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

  serverExternalPackages: ["drizzle-orm", "postgres"],

  transpilePackages: ["@mui/material", "@mui/system", "@mui/icons-material"],

  reactStrictMode: true,
};

module.exports = nextConfig;
