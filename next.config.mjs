/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    // Prevent webpack from processing WalletConnect's worker file
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      loader: 'raw-loader',
    });

    // Fallback for other problematic externals
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
