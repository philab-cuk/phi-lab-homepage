import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = {
  admin: 'Admin',
  professor: 'Professor',
  researcher: 'Researcher',
  alumni: 'Alumni',
}

// role -> 메뉴 항목 매핑
function buildMenu(role) {
  const editor = role === 'admin' || role === 'professor'
  const whitelisted = !!role
  const items = []

  if (editor) {
    items.push({ to: '/admin/users',        label: 'Users / Invites' })
    items.push({ to: '/admin/members',      label: 'Members' })
    items.push({ to: '/admin/publications', label: 'Publications' })
    items.push({ to: '/admin/research',     label: 'Research' })
    items.push({ to: '/admin/lectures',     label: 'Lectures' })
  }
  if (whitelisted) {
    items.push({ to: '/admin/news',  label: 'News' })
    items.push({ to: '/admin/posts', label: 'Posts' })
  }
  return items
}

export default function AdminLayout() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const menu = buildMenu(role)

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#1a1a1a', color: '#eee', padding: '1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
            PHI Lab Admin
          </Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavMenuLink to="/admin" end label="Dashboard" />
          {menu.map((m) => (
            <NavMenuLink key={m.to} to={m.to} label={m.label} />
          ))}
        </nav>
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #444', fontSize: '0.875rem' }}>
          <div>{profile?.display_name || profile?.email}</div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
            {ROLE_LABEL[role] || role}
          </div>
          <button
            onClick={handleSignOut}
            style={{ marginTop: '0.5rem', background: 'transparent', color: '#ccc', border: '1px solid #555', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ padding: '1.5rem', background: '#fafafa' }}>
        <Outlet />
      </main>
    </div>
  )
}

function NavMenuLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        color: isActive ? '#fff' : '#bbb',
        background: isActive ? '#333' : 'transparent',
        padding: '0.4rem 0.6rem',
        textDecoration: 'none',
        fontSize: '0.9rem',
        borderRadius: 2,
      })}
    >
      {label}
    </NavLink>
  )
}
