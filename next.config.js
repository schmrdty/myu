// Location: /next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any domain (for development)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Disable strict mode for development
  reactStrictMode: false,
  
  // Allow external access
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // Webpack configuration to handle chunk loading
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.publicPath = '/_next/';
    }
    return config;
  },
};

module.exports = nextConfig;
