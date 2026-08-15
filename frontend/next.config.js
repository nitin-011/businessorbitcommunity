/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: [
      "static.prod-images.emergentagent.com",
      "images.unsplash.com",
      "images.pexels.com",
      "res.cloudinary.com",
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  },
};

module.exports = nextConfig;
