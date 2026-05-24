// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     // Required so that NEXT PROXY can receive cookies from other origins
//     serverActions: {
//       allowedOrigins: [
//         "https://api.mockapi.io.vn", 
//         "https://mock-api-server-sy5n.onrender.com",// backend
//         "http://localhost:3000",                     // local frontend
//         "https://mockapi.io.vn",          // prod frontend
//       ],
//     },
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // This makes /api/login actually call your Render server
        // but the browser THINKS it is calling your frontend domain
        source: '/api/:path*',
        //destination: 'https://api.mockapi.io.vn/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;