'use client'

import Logo from '@/components/Logo'
import Nav from '@/components/Nav'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const suggestions = [
	'Tell me about recent RBI schemes',
	'List some useful schemes for women in india',
	'What is gokul mission?',
]

export default function Home() {
	const [message, setMessage] = useState('')
	const router = useRouter()
	const { data: session } = useSession()
	const navigate = (altMessage?: string) => {
		if (!session) {
			return router.push('/register')
		}
		console.log(session)
		router.push(`/chat?prompt=${altMessage ?? message}`)
	}
	const handleSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		event.preventDefault()
		if (!session) {
			return router.push('/register')
		}
		console.log({ session })
		navigate()
	}
	const handleTextareaKeyDown = (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			if (!session) {
				router.push('/register')
				return
			}
			handleSubmit(event)
		}
	}
	return (
		<>
			<Nav />
			<section className="h-screen grid place-content-center text-center">
				<Image
					src={'/assistant.png'}
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
						onClick={() => {
							if (!session) {
								return router.push('/register')
							}
							if (message) router.push(`/chat?prompt=${message}`)
						}}
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
		</>
	)
}
