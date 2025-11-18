import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Required so that NEXT PROXY can receive cookies from other origins
    serverActions: {
      allowedOrigins: [
        "https://mock-api-server-sy5n.onrender.com", // backend
        "http://localhost:3000",                     // local frontend
        "https://your-frontend-domain.com",          // prod frontend
      ],
    },
  },
};

export default nextConfig;