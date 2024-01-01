import {
	defineConfig,
	presetUno,
	presetIcons,
	transformerVariantGroup,
} from 'unocss'

export default defineConfig({
	presets: [
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
				height: '1.5rem',
				width: '1.5rem',
				color: 'currentColor',
			},
		}),
		presetUno(),
	],
	theme: {
		colors: {
			accent: {
				900: 'hsl(var(--accent-900))',
				700: 'hsl(var(--accent-700))',
				500: 'hsl(var(--accent-500))',
				300: 'hsl(var(--accent-300))',
			},
			green: 'hsl(var(--green))',
			orange: 'hsl(var(--orange))',
		},
	},
	transformers: [transformerVariantGroup()],
})
