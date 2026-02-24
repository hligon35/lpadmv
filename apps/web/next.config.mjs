/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,

	// Security headers (safe defaults). No CSP here to avoid breaking Next.js inline scripts.
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Strict-Transport-Security', value: 'max-age=15552000' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{ key: 'X-DNS-Prefetch-Control', value: 'on' },
					{ key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
					{ key: 'X-Download-Options', value: 'noopen' },
					{ key: 'X-XSS-Protection', value: '0' },
				],
			},
		];
	},
};

export default nextConfig;
