/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config, { isServer }) => {
    // Prevent webpack from processing WalletConnect's worker file
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      loader: 'raw-loader',
    });

    // Mock indexedDB for server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        indexedDB: false,
      };
    }

    // Fallback for other problematic externals
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Suppress hydration warnings in development
  reactStrictMode: false,
};

export default nextConfig;
