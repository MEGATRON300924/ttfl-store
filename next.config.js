/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "alicdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.alicdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aliexpress-media.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.aliexpress-media.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.aliexpress.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "https://ttfl-store-backend-af5u.onrender.com" : "http://localhost:4000")).replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
