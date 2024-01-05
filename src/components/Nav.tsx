'use client'
import React, { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
const Nav = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const [dropdownVisible, setDropdownVisible] = useState(false)

	const toggleDropdown = () => {
		setDropdownVisible(!dropdownVisible)
	}

	return (
		<div className="absolute top-0 left-0 right-0 w-full bg-brown-0 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-30 border border-gray-100 flex pt-4 pb-4 pr-8 pl-8">
			{session ? (
				<div
					onClick={toggleDropdown}
					className="text-lg text-white ml-auto flex gap-2 items-center cursor-pointer"
				>
					<Image
						src={session?.user?.image || '/user.png'}
						alt=""
						className="rounded-full"
						width={40}
						height={40}
					/>
					<span>{session?.user?.name}</span>
					{dropdownVisible && (
						<div className="absolute top-full p-2 rounded-md shadow-lg bg-transparent ring-1 ring-black ring-opacity-5 transition-all duration-300">
							<div
								className="py-1 bg-[#251f1e] rounded-md"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="options-menu"
							>
								<button
									onClick={() => signOut()}
									className="block px-4 py-2 text-sm text-gray-100"
									role="menuitem"
								>
									Sign Out
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="ml-auto">
					<button
						onClick={() => {
							console.log('hello world')
							router.push('/register')
						}}
						className="bg-accent-500 pb-2 pt-2 pl-4 pr-4 rounded mt-2 bg-orange text-xl"
					>
						Sign in
					</button>
				</div>
			)}
		</div>
	)
}

export default Nav
