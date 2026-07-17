import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = {
  admin: 'Admin',
  professor: 'Professor',
  researcher: 'Researcher',
  alumni: 'Alumni',
}

// role -> 섹션별 메뉴. 공통(whitelist 전원) / Admin(editor 전용)
function buildMenu(role) {
  const editor = role === 'admin' || role === 'professor'

  const sections = [
    {
      title: '공통',
      items: [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/my-profile', label: 'My Profile' },
        { to: '/admin/news', label: 'News' },
        { to: '/admin/gallery', label: 'Gallery' },
        { to: '/admin/posts', label: 'Posts' },
      ],
    },
  ]

  if (editor) {
    sections.push({
      title: 'Admin',
      items: [
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/professor', label: 'Professor' },
        { to: '/admin/members', label: 'Members / Invites' },
        { to: '/admin/institutions', label: 'Institutions' },
        { to: '/admin/publications', label: 'Publications' },
        { to: '/admin/research', label: 'Research' },
        { to: '/admin/lectures', label: 'Lectures' },
      ],
    })
  }
  return sections
}

export default function AdminLayout() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const sections = buildMenu(role)

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#1a1a1a', color: '#eee', padding: '1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
            PHI Lab Admin
          </Link>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {sections.map((sec) => (
            <div key={sec.title} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#777', padding: '0.25rem 0.6rem', marginBottom: '0.25rem' }}>
                {sec.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {sec.items.map((m) => (
                  <NavMenuLink key={m.to} to={m.to} label={m.label} end={m.end} />
                ))}
              </div>
            </div>
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
        padding: '0.6rem 0.7rem',
        textDecoration: 'none',
        fontSize: '0.9rem',
        borderRadius: 3,
      })}
    >
      {label}
    </NavLink>
  )
}
