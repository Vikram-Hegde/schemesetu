'use client'

import { useState } from 'react'
import Logo from '@/components/Logo'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const suggestions = [
	'Tell me about recent RBI schemes',
	'List some useful schemes for women in india',
	'What is gokul mission?',
]

export default function Home() {
	const [message, setMessage] = useState('')
	const router = useRouter()

	const navigate = (altMessage?: string) =>
		router.push(`/chat?prompt=${altMessage ?? message}`)

	const handleSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		event.preventDefault()
		navigate()
	}
	const handleTextareaKeyDown = (
		event: React.KeyboardEvent<HTMLTextAreaElement>
	) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			handleSubmit(event)
		}
	}
	return (
		<section className="h-screen grid place-content-center text-center">
			<Image
				src={'/assistant.svg'}
				width={70}
				height={70}
				alt="scheme setu logo"
				className="justify-self-center"
			/>
			<Logo />
			<h1 className="font-normal mt-2 mb-6 text-4xl">
				Finding <b>government schemes</b> made easy
			</h1>
			<form className="flex bg-accent-700 rounded w-[min(calc(100%-2rem),42rem)] justify-self-center border border-accent-500 border-solid focus-within:(ring-4 ring-offset ring-accent/10)">
				<textarea
					rows={4}
					className="outline-none p-2 placeholder:text-accent-300 resize-none flex-1 caret-orange"
					placeholder="Describe what you're looking for"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleTextareaKeyDown}
					autoFocus
				></textarea>
				<button
					type="button"
					onClick={() => router.push(`/chat?message=${message}`)}
					className="self-end mb-2 mr-2 bg-accent-300/50 p-2 rounded flex"
				>
					<i className="i-lucide:send w-5 h-5" />
				</button>
			</form>
			<div className="flex flex-wrap justify-center gap-4 mt-6 w-[min(calc(100%-2rem),42rem)] mx-auto ">
				{suggestions.map((suggestion) => (
					<button
						className="py-2 px-4 bg-accent-700 rounded-2"
						key={suggestion}
						onClick={() => {
							navigate(suggestion)
						}}
					>
						{suggestion}
					</button>
				))}
			</div>
		</section>
	)
}
