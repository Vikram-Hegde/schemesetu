'use client'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import React, { useState } from 'react'
import Logo from './Logo'
const Register = () => {
	const [isLogin, setIsLogin] = useState(false)
	const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const email = formData.get('login_email')
		const password = formData.get('login_password')

		signIn('credentials', {
			email,
			password,
			callbackUrl: '/',
		})
	}
	const handleSigninSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const email = formData.get('register_email')
		const password = formData.get('register_password')
		const username = formData.get('register_username')

		const response = await fetch('/api/auth/signin', {
			method: 'POST',
			body: JSON.stringify({ email, password, username }),
			headers: {
				'Content-Type': 'application/json',
			},
		})
		const result = await response.json()
		if (result?.message === 'success') {
			signIn('credentials', {
				email,
				password,
				callbackUrl: '/',
			})
		} else {
			alert(result?.message)
		}
	}

	const toggleMode = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		e.preventDefault()
		const form = e.currentTarget.closest('form')!
		form.reset()
	}
	return (
		<section className="h-screen grid place-content-center text-center">
			<main className="flex flex-col p-4 bg-accent-700 rounded-4 border border-accent-500 border-solid">
				<Logo className="text-xl text-left" />
				<p className="mt-1 mb-4">
					Sign in to access more features of this platform.
				</p>
				<div className="providers flex flex-col gap-2 mt-2 mb-4">
					<button
						className="flex bg-accent-500 p-1 gap-2 justify-center items-center rounded"
						onClick={() => signIn('google')}
					>
						<Image
							src={'/google.svg'}
							alt="google"
							height={20}
							width={20}
							className="inline-flex"
						/>
						Sign in with Google
					</button>
					<button
						className="flex bg-accent-500 p-1 gap-2 justify-center items-center rounded"
						onClick={() => signIn('github')}
					>
						<i className="i-lucide:github w-5 h-5" /> Sign in with GitHub
					</button>
					<div className="border-b-gray border-b-solid border-b-[0.5px] "></div>
				</div>
				<div className="credentials">
					<section>
						{isLogin ? (
							<form onSubmit={handleLoginSubmit} className=" flex flex-col ">
								<div className="flex flex-col ">
									<label
										htmlFor="login_email"
										className="text-left text-[#928886] font-thin text-md"
									>
										Email
									</label>
									<input
										type="text"
										id="login_email"
										name="login_email"
										className="p-1 rounded outline-none bg-[#251f1e] mt-1 border border-[#3E3938] border-solid"
									/>
								</div>

								<div className="flex flex-col mt-2">
									<label
										htmlFor="login_password"
										className="text-left text-[#928886] font-thin text-md"
									>
										Password
									</label>
									<input
										type="password"
										id="login_password"
										name="login_password"
										className="p-1 rounded outline-none bg-[#251f1e] mt-1 border border-[#3E3938] border-solid"
									/>
								</div>
								<button
									type="submit"
									className="bg-accent-500 p-1 rounded mt-2 bg-orange"
								>
									Sign in
								</button>
								<p className="text-sm mt-2 gap-1 flex justify-center underline">
									Don&apos;t have an account?
									<span
										onClick={(e) => {
											toggleMode(e)
											setIsLogin(false)
										}}
										className="hover:opacity-[0.7] cursor-pointer transition"
									>
										Sign up
									</span>
								</p>
							</form>
						) : (
							<form className="flex flex-col" onSubmit={handleSigninSubmit}>
								<div className="flex flex-col ">
									<label
										htmlFor="register_username"
										className="text-left text-[#928886] font-thin text-md"
									>
										Username
									</label>
									<input
										type="text"
										id="register_username"
										name="register_username"
										className="p-1 rounded outline-none bg-[#251f1e] mt-1 border border-[#3E3938] border-solid"
									/>
								</div>

								<div className="flex flex-col mt-2">
									<label
										htmlFor="register_email"
										className="text-left text-[#928886] font-thin text-md"
									>
										Email
									</label>
									<input
										type="email"
										id="register_email"
										name="register_email"
										className="p-1 rounded outline-none bg-[#251f1e] mt-1 border border-[#3E3938] border-solid"
									/>
								</div>
								<div className="flex flex-col mt-2">
									<label
										htmlFor="register_password"
										className="text-left text-[#928886] font-thin text-md"
									>
										Password
									</label>
									<input
										type="password"
										id="register_password"
										name="register_password"
										className="p-1 rounded outline-none bg-[#251f1e] mt-1 border border-[#3E3938] border-solid"
									/>
								</div>
								<button
									type="submit"
									className="bg-accent-500 p-1 rounded mt-2 bg-orange"
								>
									Sign up
								</button>
								<p className="text-sm mt-2 gap-1 flex justify-center underline">
									Already have an account?
									<span
										onClick={(e) => {
											toggleMode(e)
											setIsLogin(true)
										}}
										className="hover:opacity-[0.7] cursor-pointer transition"
									>
										Sign in
									</span>
								</p>
							</form>
						)}
					</section>
				</div>
			</main>
		</section>
	)
}

export default Register
