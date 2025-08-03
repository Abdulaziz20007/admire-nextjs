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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
      // Localhost is a special case. You might not need to add it if you're serving images from
      // your public directory, but if you're fetching them from a local API, you should add it.
      // Note: `localhost` will have a different hostname in a production environment.
      {
        protocol: "http", // Using http because localhost often runs without https in development
        hostname: "localhost",
        port: "3000", // Specify the port
        pathname: "/**",
      },
      // Note: "usa.svg" appears to be a file, not a hostname. If it's served from
      // a specific domain, you would add that domain here.
    ],
  },
};

export default nextConfig;
