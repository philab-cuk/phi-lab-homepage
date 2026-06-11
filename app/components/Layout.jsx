import { NavLink, Outlet, Link, useLocation } from 'react-router'
import { useEffect, useState } from 'react'

const NAV_ROUTES = [
  { to: '/professor', label: 'Professor' },
  { to: '/publications', label: 'Publication' },
  { to: '/lectures', label: 'Lecture' },
  { to: '/research', label: 'Current Research' },
  { to: '/about', label: 'About Lab' },
  { to: '/members', label: 'Members' },
  { to: '/news', label: 'News' },
]

const FOOTER = {
  tagline:
    'Precision & Provenance Health Informatics Lab at the Catholic University of Korea',
  department: 'Department of Biomedical Software Engineering',
  institution: 'The Catholic University of Korea',
  addressLine1: '43, Jibong-ro, Bucheon',
  addressLine2: '14662, Gyeonggi-do, South Korea',
  email: 'hyojung.kim@catholic.ac.kr',
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const close = () => setMobileOpen(false)

  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-[960px] px-6 py-7 flex items-center justify-between">
        <Link to="/" onClick={close} className="inline-flex items-center no-underline">
          <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="PHI Lab" className="h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex gap-6 text-[17px]">
          {NAV_ROUTES.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-ink underline underline-offset-[6px] decoration-1'
                  : 'text-ink no-underline hover:underline'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="md:hidden text-sm text-ink"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-rule px-6 py-4 flex flex-col gap-3 text-[17px]">
          {NAV_ROUTES.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              className={({ isActive }) =>
                isActive ? 'underline underline-offset-4' : 'no-underline'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-rule mt-20">
      <div className="mx-auto max-w-[960px] px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-[15px]">
        <div>
          <p className="font-semibold text-ink mb-1">PHI Lab</p>
          <p className="text-muted">{FOOTER.tagline}</p>
        </div>

        <div>
          <p className="font-semibold text-ink mb-1">Contact</p>
          <address className="not-italic text-muted">
            <p>{FOOTER.department}</p>
            <p>{FOOTER.institution}</p>
            <p>{FOOTER.addressLine1}</p>
            <p>{FOOTER.addressLine2}</p>
            <p className="mt-2">
              <a href={`mailto:${FOOTER.email}`}>{FOOTER.email}</a>
            </p>
          </address>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-6 pb-8 text-xs text-meta">
        © {new Date().getFullYear()} PHI Lab.
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
