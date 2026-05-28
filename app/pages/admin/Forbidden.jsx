import { Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

export default function Forbidden() {
  const { user, signOut } = useAuth()
  return (
    <div style={{ padding: '2rem', maxWidth: 480 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>접근 권한 없음</h1>
      <p style={{ color: '#555', marginBottom: '1rem' }}>
        {user?.email ? <code>{user.email}</code> : '이 계정'} 은 PHI Lab admin 화이트리스트에 등록되어 있지 않거나, 이 페이지에 접근할 권한이 없습니다.
      </p>
      <p style={{ marginBottom: '1rem' }}>
        관리자에게 초대 토큰을 요청하거나, 다른 계정으로 다시 로그인해 주세요.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={async () => { await signOut(); window.location.href = '/admin/login' }}
          style={{ padding: '0.4rem 0.8rem', background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          다른 계정으로 로그인
        </button>
        <Link to="/" style={{ padding: '0.4rem 0.8rem', textDecoration: 'none', color: '#222', border: '1px solid #ccc' }}>
          홈으로
        </Link>
      </div>
    </div>
  )
}
