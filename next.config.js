/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to backend
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents all framing
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';", // Prevents framing
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
