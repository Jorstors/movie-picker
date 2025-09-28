import type { NextConfig } from "next";

const apiUrl = process.env.MOVIES_API_URL || "http://localhost:8000/api";

const nextConfig: NextConfig = {
  /* config options here */
  // Rewritings for proxying API requests to the backend server
  async rewrites() {
    return [
      {
        source: "/api/health",
        destination: `${apiUrl}/health`
      },
      {
        source: "/api/events",
        destination: `${apiUrl}/events`
      }
    ]
  }

};

export default nextConfig;
