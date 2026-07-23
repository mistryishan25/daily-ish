/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Add '127.0.0.1' explicitly since the logs specifically flag it
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost:3001',
    '127.0.0.1:3001',
  ],
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Permissions-Policy', value: 'clipboard-write=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;