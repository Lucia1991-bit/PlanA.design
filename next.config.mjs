import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

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
    ],
  },
  // 可以在這裡添加其他 Next.js 配置
};

export default withBundleAnalyzer(nextConfig);
