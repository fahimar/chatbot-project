/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],

  /**
   * Proxy /faces-api/* → FACES backend (same server, internal call)
   *
   * Backend runs on the same Contabo host, so we call it over localhost:
   * no public network hop, and nothing to change if the server IP changes.
   * Override with FACES_BACKEND_URL if backend ever moves to another host.
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
    const backend = process.env.FACES_BACKEND_URL || "http://localhost:8088";
    return [
      {
        source: "/faces-api/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
