/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  
  // Hostnames ONLY (Do not include :3000 or http://)
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '*.loca.lt',      // Allows phone access via localtunnel
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