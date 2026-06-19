/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sketch photos arrive as base64 in the request body; keep route handlers happy
  // with larger payloads even though we downscale client-side first.
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
