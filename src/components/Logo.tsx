interface LogoProps {
	className?: string
}

export default function Logo({ className }: LogoProps) {
	return (
		<h2 className={`text-orange text-3xl ${className}`}>
			Scheme<span className="text-green">Setu</span>
		</h2>
	)
}
