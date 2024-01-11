import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import RegisterComponent from '@/components/Register'

const Register = async () => {
	const session = await getServerSession()
	if (session && session.user) {
		return redirect('/')
	}
	return <RegisterComponent />
}

export default Register
