/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  // No rewrites needed — all API calls handled in pages/api/chat.js proxy route
  // Backend (localhost:8000) is intentionally unused. FACES API (167.86.78.35:8088) used directly.
};

module.exports = nextConfig;
