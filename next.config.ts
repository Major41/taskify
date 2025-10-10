import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "tasksfy.com",
      "192.168.100.4",
      "192.168.0.103",
      "localhost",
      "127.0.0.1",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
