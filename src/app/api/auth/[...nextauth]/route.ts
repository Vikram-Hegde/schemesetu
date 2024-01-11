import User from '@/models/user'
import { connectToDatabase } from '@/utils/database'
import { compare } from 'bcrypt'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
		CredentialsProvider({
			// The name to display on the sign in form (e.g. "Sign in with...")
			name: 'Credentials',
			credentials: {
				email: {},
				password: {},
			},
			async authorize(credentials, req) {
				try {
					// Add logic here to look up the user from the credentials supplied
					const { email, password } = credentials || { email: '', password: '' }
					await connectToDatabase()

					const user = await User.findOne({
						email,
					}).select('+password')
					if (!user) {
						return null
					}
					const result = await compare(password, user.password)

					console.log({ result, user })
					if (result) {
						return {
							...user,
							name: user._doc.username,
							email: user._doc.email,
							image: '',
						}
					}
					return null
				} catch (err) {
					console.log(err)
					console.log('chipi chipi chapa chapa doobie doobie daba daba')
					return null
				}
			},
		}),
	],
	callbacks: {
		async session({ session }) {
			try {
				await connectToDatabase()

				const sessionUser = await User.findOne({ email: session?.user?.email })
				const userId = sessionUser?._id?.toString()
				return {
					...session,
					user: {
						...session.user,
						id: userId,
					},
				}
			} catch (err) {
				return {
					...session,
				}
			}
		},
		async signIn({ account, profile, user, credentials }) {
			try {
				await connectToDatabase()
				console.log('----------------------------------')
				console.log({ user })
				console.log('----------------------------------')
				const userExists = await User.findOne({ email: user.email })

				console.log({ user })
				if (!userExists) {
					await User.create({
						email: user?.email,
						username: user?.name?.replace(' ', '').toLowerCase(),
						image: user?.image,
					})
				}
				return true
			} catch (err) {
				console.log(err)
				console.log('chipi chipi chapa chapa doobie doobie daba daba ')
				return false
			}
		},
	},
})

export { handler as GET, handler as POST }
