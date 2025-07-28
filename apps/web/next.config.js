const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    env: {
        NEXT_PUBLIC_API_URL,
    },

     // Security Headers
    async headers() {
        return [
        {
            source: '/(.*)',
            headers: [
            {
                value: 'DENY',
                key: 'X-Frame-Options'
            },
            {
                value: 'nosniff',
                key: 'X-Content-Type-Options'
            },
            {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin'
            },
            {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
            },
            {
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000; includeSubDomains; preload'
            },
            {
                key: 'Content-Security-Policy',
                value:
                "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: http://localhost:3001; frame-ancestors 'none';"
            }
            ]
        }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${NEXT_PUBLIC_API_URL}/:path*`,
            },
        ];
    },
    images: {
        domains: ['localhost'],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },

    // Compiler options
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
    }
};

module.exports = nextConfig;