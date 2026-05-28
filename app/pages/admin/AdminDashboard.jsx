import { Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const { profile, role, isEditor } = useAuth()

  const cards = []
  if (isEditor) {
    cards.push({ to: '/admin/members',      label: 'Members 관리' })
    cards.push({ to: '/admin/publications', label: 'Publications 관리' })
    cards.push({ to: '/admin/research',     label: 'Research 관리' })
    cards.push({ to: '/admin/lectures',     label: 'Lectures 관리' })
    cards.push({ to: '/admin/users',        label: 'Users / Invites' })
  }
  cards.push({ to: '/admin/my-profile', label: '내 프로필' })
  cards.push({ to: '/admin/news',  label: 'News 작성' })
  cards.push({ to: '/admin/posts', label: 'Posts 작성' })

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>
        환영합니다, <strong>{profile?.display_name || profile?.email}</strong> ({role}).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              padding: '1rem',
              textDecoration: 'none',
              color: '#222',
              borderRadius: 4,
            }}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
