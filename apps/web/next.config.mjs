const standaloneOutput = process.env.NEXT_STANDALONE !== 'false';

const nextConfig = {
  output: standaloneOutput ? 'standalone' : undefined,
};

export default nextConfig;
