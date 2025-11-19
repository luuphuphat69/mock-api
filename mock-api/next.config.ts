import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required so that NEXT PROXY can receive cookies from other origins
    serverActions: {
      allowedOrigins: [
        "https://api.mockapi.io.vn", // backend
        "http://localhost:3000",                     // local frontend
        "https://mockapi.io.vn",          // prod frontend
      ],
    },
  },
};

export default nextConfig;