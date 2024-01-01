/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		// See https://webpack.js.org/configuration/resolve/#resolvealias
		config.resolve.alias = {
			...config.resolve.alias,
			sharp$: false,
			'onnxruntime-node$': false,
		}
		return config
	},
	// Indicate that these packages should not be bundled by webpack
	experimental: {
		serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
	},
}

module.exports = nextConfig
