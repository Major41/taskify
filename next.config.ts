import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "192.168.225.93",
      "localhost",
      "127.0.0.1",
      "tasksfy.com",
      // Add other domains you use for images
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.225.93",
        port: "8080",
        pathname: "/image_1_pictures/**",
      },
      {
        protocol: "http",
        hostname: "192.168.225.93",
        port: "8080",
        pathname: "/image_2_pictures/**",
      },
      {
        protocol: "https",
        hostname: "tasksfy.com",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "192.168.225.93",
        port: "8080",
        pathname: "/image_3_pictures/**",
      },
      {
        protocol: "http",
        hostname: "192.168.100.4",
      },
      {
        protocol: "http",
        hostname: "192.168.0.103",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
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
