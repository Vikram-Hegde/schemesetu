import type { Metadata } from 'next'
import './globals.css'
import { Titillium_Web } from 'next/font/google'

const titillium = Titillium_Web({
	weight: ['400', '600'],
	subsets: ['latin'],
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'SchemeSetu',
	description:
		'A helpful chatbot to help you find the right scheme based on your needs',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={titillium.className}>{children}</body>
		</html>
	)
}
