/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Add '127.0.0.1' explicitly since the logs specifically flag it
  allowedDevOrigins: ['*.app.github.dev', 'localhost:3000', '127.0.0.1:3000'],
  
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