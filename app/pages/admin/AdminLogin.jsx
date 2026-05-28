import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLogin() {
  const { isAuthenticated, signIn, signInWithGoogle, loading } = useAuth()
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0', color: '#999', fontSize: '0.8rem' }}>
        <span style={{ flex: 1, height: 1, background: '#ddd' }} /> 또는 <span style={{ flex: 1, height: 1, background: '#ddd' }} />
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle(window.location.origin + (location.state?.from?.pathname ? location.state.from.pathname : '/admin'))}
        style={{ width: '100%', padding: '0.5rem 1rem', background: '#fff', color: '#222', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
      >
        <span style={{ fontWeight: 'bold', color: '#4285F4' }}>G</span> Google 로 로그인
      </button>
      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
        초대받은 이메일의 구글 계정으로 로그인하세요.
      </p>
      </div>
    </div>
  )
}
