/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/datj4og4i/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/plan-a-design-app.appspot.com/**",
      },
    ],
  },
};

export default nextConfig;
