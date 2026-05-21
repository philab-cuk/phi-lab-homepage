import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLogin() {
  const { isAuthenticated, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message || '로그인 실패')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 420 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc' }}
          />
        </div>
        {error && (
          <div style={{ color: '#b00', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '0.5rem 1rem', background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
      {/* TODO(cutover): Google OAuth provider 활성화 후 아래 버튼 노출
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
          Google 로 로그인
        </button>
      */}
    </div>
  )
}
