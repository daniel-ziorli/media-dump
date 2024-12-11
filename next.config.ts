import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  reactStrictMode: true,
  env: {
    GITHUB_APIKEY: process.env.GITHUB_APIKEY,
  }
}

export default nextConfig;
