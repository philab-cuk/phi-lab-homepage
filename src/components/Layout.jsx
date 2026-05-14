import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

// Ordered list of nav items mirroring philabcuk.org menu order/labels.
const NAV_ROUTES = [
  { to: '/professor', label: 'Professor' },
  { to: '/publications', label: 'Publication' },
  { to: '/lectures', label: 'Lecture' },
  { to: '/research', label: 'Current Research' },
  { to: '/about', label: 'About Lab' },
  { to: '/members', label: 'Members' },
]

const FOOTER = {
  tagline:
    'Precision & Provenance Health Informatics Lab at the Catholic University of Korea',
  contact: 'Contact',
  department: 'Department of Biomedical Software Engineering',
  institution: 'The Catholic University of Korea',
  addressLine1: '43, Jibong-ro, Bucheon',
  addressLine2: '14662, Gyeonggi-do, South Korea',
  email: 'hyojung.kim@catholic.ac.kr',
  collaborators: 'Collaborating Institutions',
  copyright: 'PHI Lab. All rights reserved.',
}

const COLLABORATING_INSTITUTIONS = [
  'Samsung Medical Center',
  'Kakao Healthcare',
  "Eunpyeong St. Mary's Hospital",
  "Bucheon St. Mary's Hospital",
  "Sookmyung Women's University",
  'Chonnam National University',
  'University of Cincinnati',
  'Harvard University',
  'Tufts University',
  'Sungkyunkwan University (SKKU)',
]

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="PHI Lab — Catholic University of Korea">
            <img
              src="/logo.jpg"
              alt="PHI Lab — Precision & Provenance Health Informatics Lab, Catholic University of Korea"
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ROUTES.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:text-brand-700 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-brand-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2 gap-1">
            {NAV_ROUTES.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:text-brand-700 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-3">PHI Lab</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{FOOTER.tagline}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{FOOTER.contact}</h3>
            <address className="not-italic text-sm text-gray-400 leading-relaxed space-y-1">
              <p>{FOOTER.department}</p>
              <p>{FOOTER.institution}</p>
              <p>{FOOTER.addressLine1}</p>
              <p>{FOOTER.addressLine2}</p>
              <p className="mt-3">
                <a
                  href={`mailto:${FOOTER.email}`}
                  className="text-amber-300 hover:text-amber-200 underline underline-offset-2 decoration-amber-300/60 hover:decoration-amber-200 font-medium transition-colors"
                >
                  {FOOTER.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{FOOTER.collaborators}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {COLLABORATING_INSTITUTIONS.join(' · ')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {FOOTER.copyright}
        </div>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
