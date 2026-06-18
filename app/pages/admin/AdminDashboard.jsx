import { Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

// 사이드바 메뉴와 같은 순서/구분. 카드마다 한 줄 설명.
const COMMON = [
  { to: '/admin/my-profile', label: 'My Profile', desc: '내 멤버 정보 등록·수정' },
  { to: '/admin/news',       label: 'News',      desc: '소식 작성' },
  { to: '/admin/posts',      label: 'Posts',     desc: '글 작성' },
]
const ADMIN = [
  { to: '/admin/users',        label: 'Users / Invites', desc: '계정·멤버 초대 관리' },
  { to: '/admin/professor',    label: 'Professor',       desc: '교수 프로필 (학력·경력)' },
  { to: '/admin/members',      label: 'Members',         desc: '멤버 + 역할(Member Roles)' },
  { to: '/admin/institutions', label: 'Institutions',    desc: '협력 기관' },
  { to: '/admin/publications', label: 'Publications',    desc: '논문·발표' },
  { to: '/admin/research',     label: 'Research',        desc: '연구 과제' },
  { to: '/admin/lectures',     label: 'Lectures',        desc: '강의 (사진 포함)' },
]

function CardGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
      {items.map((c) => (
        <Link
          key={c.to}
          to={c.to}
          style={{ background: '#fff', border: '1px solid #ddd', padding: '0.9rem 1rem', textDecoration: 'none', color: '#222', borderRadius: 4 }}
        >
          <div style={{ fontWeight: 600 }}>{c.label}</div>
          {c.desc && <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.25rem' }}>{c.desc}</div>}
        </Link>
      ))}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', margin: '0 0 0.5rem' }}>
      {children}
    </h2>
  )
}

export default function AdminDashboard() {
  const { profile, role, isEditor } = useAuth()

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>
        환영합니다, <strong>{profile?.display_name || profile?.email}</strong> ({role}).
      </p>

      <SectionTitle>공통</SectionTitle>
      <CardGrid items={COMMON} />

      {isEditor && (
        <>
          <SectionTitle>운영 (Admin)</SectionTitle>
          <CardGrid items={ADMIN} />
        </>
      )}
    </div>
  )
}
