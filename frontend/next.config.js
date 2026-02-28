/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],

  /**
   * Proxy /faces-api/* → http://167.86.78.35:8088/*
   *
   * Used for:
   *   GET  /faces-api/sessions/:id/history  → load chat history
   *   DELETE /faces-api/sessions/:id/history → clear history
   *   DELETE /faces-api/sessions/:id          → delete session
   *   GET  /faces-api/health                  → health check
   *
   * POST /chat is handled separately via pages/api/chat.js
   * (needs custom timeout logic that rewrites can't provide)
   */
  async rewrites() {
    return [
      {
        source: "/faces-api/:path*",
        destination: "http://167.86.78.35:8088/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
