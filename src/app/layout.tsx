import Provider from '@/components/Provider'
import type { Metadata } from 'next'
import { Titillium_Web } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

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
			<Provider>
				<body className={titillium.className}>
					<Toaster position="bottom-center" />
					{children}
				</body>
			</Provider>
		</html>
	)
}
