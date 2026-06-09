const standaloneOutput = process.env.NEXT_STANDALONE !== 'false';

const nextConfig = {
  basePath: '/gov',
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: 'http://localhost:4000/api/v1/:path*' }];
  },
  output: standaloneOutput ? 'standalone' : undefined,
};

export default nextConfig;
