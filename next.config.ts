import type { NextConfig } from "next";

// Default to localhost for local development
let apiUrl = "http://localhost:8000";

// Use environment variable for production
if (!process.env.LOCAL_DEV) {
  apiUrl = process.env.MOVIE_PICKER_API_URL || "http://backend:8000";
  console.log("Using production API URL");
} else {
  console.log("Using local development API URL");
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
