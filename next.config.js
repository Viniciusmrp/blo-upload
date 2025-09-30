/** @type {import('next').NextConfig} */
const nextConfig = {
  // ADD THIS WEBPACK CONFIG
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig