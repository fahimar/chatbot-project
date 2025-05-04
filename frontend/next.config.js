/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  async rewrites() {
    // Add fallback handling for undefined environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    console.log("API URL for rewrites:", apiUrl); // Debug log

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
