'use client'

import Logo from '@/components/Logo'
import { useChat } from 'ai/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Chat() {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		append,
		isLoading,
	} = useChat({
		api: '/api/chat/openrouter',
	})
	const params = useSearchParams()
	const prompt = params.get('prompt')
	// const isFirstRun = useRef(true)
	const [autoScroll, setAutoScroll] = useState(true)

	useEffect(() => {
		// if (isFirstRun.current) {
		// 	isFirstRun.current = false
		// 	return
		// }
		if (prompt) {
			append({ content: prompt, role: 'user' })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const chatWindow = document.querySelector('html') as HTMLElement
		const scrollHandler = () => {
			if (
				chatWindow.scrollHeight -
					chatWindow.scrollTop -
					chatWindow.clientHeight <
				80
			) {
				setAutoScroll(true)
			} else {
				setAutoScroll(false)
			}
		}
		window.addEventListener('scroll', scrollHandler)

		const handleKeyboardShortcut = (event: KeyboardEvent) => {
			switch (event.key) {
				case '/':
					event.preventDefault()
					const input = document.querySelector('input') as HTMLInputElement
					input.focus()
					break
				default:
					break
			}
		}
		window.addEventListener('keydown', handleKeyboardShortcut)
		return () => {
			window.removeEventListener('scroll', scrollHandler)
			window.removeEventListener('keydown', handleKeyboardShortcut)
		}
	}, [])

	useEffect(() => {
		const chatWindow = document.querySelector('html') as HTMLElement
		if (autoScroll)
			chatWindow.scrollTo({
				top: chatWindow.scrollHeight,
				// behavior: 'smooth',
			})
	}, [messages, autoScroll])

	const { data: session } = useSession()
	return (
		<section className="chat-messages | grid grid-rows-[auto_1fr_auto] min-h-screen">
			<header className="position-sticky top-0 flex justify-between items-center py-5 p-inline-[max(1.5rem,50%-42rem/2)]">
				<Link href="/" className="decoration-none">
					<Logo className="text-center" />
				</Link>
				<button
					className="bg-accent-300/50 p-2 rounded flex self-center"
					onClick={() => {
						navigator.clipboard.writeText(
							messages
								.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
								.join('\n\n'),
						)
					}}
				>
					<i className="i-lucide:clipboard w-4 h-4" />
				</button>
			</header>
			<main
				className="flex flex-col gap-5 justify-end p-inline-[max(1.5rem,50%-42rem/2)] "
				onScroll={() => console.log('hello there')}
			>
				{messages.map((m, index) => (
					<div
						key={index}
						className={`flex gap-2 ${
							m.role === 'user' ? 'justify-end' : 'justify-start'
						}`}
					>
						<Image
							src={
								m.role === 'user'
									? session?.user?.image || '/user.png'
									: '/assistant.png'
							}
							alt={`message from ${m.role}`}
							className={`mt-auto rounded-full ${
								m.role === 'user' ? 'order-2' : ''
							}`}
							height={32}
							width={32}
						/>
						<div
							className={`chat-message max-w-lg py-2 px-4 rounded-2 ${
								m.role === 'user' ? 'bg-accent-500' : 'bg-accent-700'
							}`}
						>
							<Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
						</div>
					</div>
				))}
			</main>
			<form
				onSubmit={
					!isLoading
						? handleSubmit
						: (e) => {
								e.preventDefault()
							}
				}
				className="position-sticky bottom-2 flex bg-accent-700 rounded w-[min(100%-2rem,42rem)] justify-self-center border border-accent-500 border-solid my-4"
			>
				<input
					type="text"
					className="w-full outline-none p-2 placeholder:text-accent-300 caret-orange"
					placeholder="Describe what you're looking for"
					value={input}
					onChange={handleInputChange}
					autoFocus
				/>
				<button
					type="submit"
					className="mr-1 bg-accent-300/50 p-2 rounded flex self-center"
					disabled={isLoading}
				>
					{isLoading ? (
						<i className="animate-spin i-lucide:refresh-cw w-4 h-4" />
					) : (
						<i className="i-lucide:send w-4 h-4" />
					)}
				</button>
			</form>

			{!autoScroll && (
				<button
					className="position-fixed md:right-4 md:bottom-4 bg-accent-300/50 p-2 rounded flex self-center"
					onClick={() => setAutoScroll(true)}
				>
					<i className="i-lucide:arrow-down w-4 h-4" />
				</button>
			)}
		</section>
	)
}
