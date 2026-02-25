/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Workaround for Next.js 16 _global-error pre-rendering issue
  // https://github.com/vercel/next.js/issues/72958
  experimental: {
    prerenderEarlyExit: false,
  },
};

export default nextConfig;
