/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent webpack from processing WalletConnect's worker file
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      loader: 'raw-loader',
    });

    // Mock browser APIs for SSR
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        indexedDB: false,
        localStorage: false,
        sessionStorage: false,
      };
      
      // Polyfill indexedDB for server-side
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.environment.tap('IndexedDBPolyfill', () => {
            if (typeof global.indexedDB === 'undefined') {
              global.indexedDB = {} as any;
            }
          });
        },
      });
    }

    // Fallback for other problematic externals
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  
  // Suppress hydration warnings in development
  reactStrictMode: false,
};

export default nextConfig;
