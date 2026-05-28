import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const ERROR_KO = {
  not_authenticated: '로그인이 필요합니다.',
  invalid_invite: '유효하지 않은 초대입니다.',
  invite_already_used: '이미 사용된 초대입니다.',
  invite_expired: '만료된 초대입니다. 관리자에게 새 초대를 요청하세요.',
  invite_email_mismatch: '초대받은 이메일과 로그인한 계정이 다릅니다. 초대받은 이메일로 로그인하세요.',
}

export default function AdminAccept() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { isAuthenticated, user, signInWithGoogle, loading } = useAuth()
  const [status, setStatus] = useState('idle') // idle | redeeming | success | error
  const [message, setMessage] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (loading || !isAuthenticated || !token || status !== 'idle') return
    setStatus('redeeming')
    supabase.rpc('redeem_invite', { invite_token: token }).then(({ data, error }) => {
      if (error) {
        setStatus('error')
        setMessage(ERROR_KO[error.message] || error.message)
      } else {
        setStatus('success')
        setResult(data)
      }
    })
  }, [loading, isAuthenticated, token, status])

  const box = { padding: '2rem', maxWidth: 460 }

  if (!token) {
    return <div style={box}><h1 style={{ fontSize: '1.5rem' }}>초대 수락</h1><p style={{ color: '#b00' }}>초대 토큰이 없습니다. 받은 링크를 다시 확인하세요.</p></div>
  }

  if (loading) {
    return <div style={box}><h1 style={{ fontSize: '1.5rem' }}>초대 수락</h1><p>확인 중…</p></div>
  }

  // 로그인 전: 구글 로그인 (수락 페이지로 돌아오게)
  if (!isAuthenticated) {
    return (
      <div style={box}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>초대 수락</h1>
        <p style={{ color: '#555', marginBottom: '1rem' }}>
          초대받은 이메일의 <strong>구글 계정</strong>으로 로그인하면 자동으로 등록됩니다.
        </p>
        <button
          type="button"
          onClick={() => signInWithGoogle(window.location.href)}
          style={{ width: '100%', padding: '0.6rem 1rem', background: '#fff', color: '#222', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <span style={{ fontWeight: 'bold', color: '#4285F4' }}>G</span> Google 로 로그인하고 수락
        </button>
      </div>
    )
  }

  // 로그인 후
  return (
    <div style={box}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>초대 수락</h1>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>로그인: {user?.email}</p>

      {status === 'redeeming' && <p>등록 중…</p>}

      {status === 'error' && (
        <>
          <div style={{ background: '#fee', border: '1px solid #fcc', color: '#900', padding: '0.6rem 0.8rem', marginBottom: '1rem' }}>{message}</div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #ccc', background: '#fff' }}>
            다른 계정으로 로그인
          </button>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ background: '#efe', border: '1px solid #cfc', color: '#070', padding: '0.6rem 0.8rem', marginBottom: '1rem' }}>
            등록 완료! 역할: <strong>{result?.role}</strong>
            {result?.already_member && ' (이미 등록된 계정)'}
          </div>
          <Link to="/admin" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#222', color: '#fff', textDecoration: 'none' }}>
            Admin 으로 이동
          </Link>
        </>
      )}
    </div>
  )
}
