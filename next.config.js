/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable server features that need Node.js runtime
  trailingSlash: true,
};

module.exports = nextConfig;
