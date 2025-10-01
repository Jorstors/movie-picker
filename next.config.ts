import type { NextConfig } from "next";

const apiUrl = process.env.MOVIE_PICKER_API_URL || "http://backend:8000";

if (!apiUrl) {
  throw new Error("MOVIE_PICKER_API_URL environment variable is not set");
}

const nextConfig: NextConfig = {
  /* config options here */
  // Rewritings for proxying API requests to the backend server
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*` // Proxy to Backend
      }
    ]
  }

};

export default nextConfig;
