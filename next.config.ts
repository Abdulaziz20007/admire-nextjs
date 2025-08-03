import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.admirelc.uz",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
