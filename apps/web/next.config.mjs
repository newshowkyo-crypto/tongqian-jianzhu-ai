const standaloneOutput = process.env.NEXT_STANDALONE !== 'false';

const withPWA = (config) => ({
  ...config,
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
  },
});

const nextConfig = {
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: 'http://localhost:4000/api/v1/:path*' }];
  },
  output: standaloneOutput ? 'standalone' : undefined,
};

export default withPWA(nextConfig);
