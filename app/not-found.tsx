import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-[#121212]">
      <h1 className="text-6xl font-extrabold text-[#FF6B00]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-white/45">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]"
      >
        Go back home
      </Link>
    </div>
  )
}
