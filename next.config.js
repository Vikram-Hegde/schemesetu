const million = require('million/compiler');
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				pathname: '/u/*',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/a/**',
			},
		],
	},
}

module.exports = million.next(
  nextConfig
, { auto: { rsc: true } }
)