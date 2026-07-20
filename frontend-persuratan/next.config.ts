import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*',
      },
    ];
  },
  allowedDevOrigins: [
    'crewless-facelift-tilt.ngrok-free.dev',
    'localhost:3000',
  ]
};

export default nextConfig;
