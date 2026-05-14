import { Link } from 'react-router-dom'
import { FlaskConical, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 shadow-sm">
        <FlaskConical size={36} className="text-brand-600" />
      </div>

      {/* Status */}
      <p className="text-7xl font-extrabold text-brand-700 leading-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-base max-w-sm leading-relaxed mb-8">
        The page you are looking for doesn&apos;t exist or may have been moved. Head back to the
        lab homepage.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-800 transition-colors text-sm shadow-sm"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
    </div>
  )
}
