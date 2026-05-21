import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-20">
      <p className="text-meta text-[15px] my-0">404</p>
      <h1 className="mt-1">Page not found</h1>
      <p className="text-muted">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <p>
        <Link to="/">← Back to home</Link>
      </p>
    </div>
  )
}
