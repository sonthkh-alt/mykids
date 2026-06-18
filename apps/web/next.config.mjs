/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-academy/ui', '@ai-academy/types', '@ai-academy/utils'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async rewrites() {
    // Proxy /api → backend khi cần (tùy chọn; mặc định gọi trực tiếp qua NEXT_PUBLIC_API_URL).
    return [];
  },
};

export default nextConfig;
