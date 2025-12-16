/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    // Also increase limit for API routes if needed, though usually handled by middleware or body parser config
    // For API routes in App Router, the limit is typically default 4mb or handled by the request method.
    // But the error specifically mentioned Server Actions, so setting this is crucial.
};

export default nextConfig;
