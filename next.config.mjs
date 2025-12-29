/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/__e2e/login",
        destination: "/e2e/login",
      },
    ];
  },
};

export default nextConfig;
