import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'

// Ordered list of nav route keys that map to t.nav
const NAV_ROUTES = [
  { to: '/', key: 'home' },
  { to: '/about', key: 'about' },
  { to: '/members', key: 'members' },
  { to: '/research', key: 'research' },
  { to: '/publications', key: 'publications' },
  { to: '/news', key: 'news' },
  { to: '/lectures', key: 'lectures' },
]

function LanguageToggle() {
  const { lang, toggle } = useLanguage()
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5 text-xs font-semibold">
      <button
        onClick={() => toggle('en')}
        className={`px-2.5 py-1 rounded transition-colors ${
          lang === 'en'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => toggle('ko')}
        className={`px-2.5 py-1 rounded transition-colors ${
          lang === 'ko'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-pressed={lang === 'ko'}
      >
        KO
      </button>
    </div>
  )
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" aria-label="PHI Lab — Catholic University of Korea">
            <img
              src="/logo.jpg"
              alt="PHI Lab — Precision & Provenance Health Informatics Lab, Catholic University of Korea"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop nav + language toggle */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1">
              {NAV_ROUTES.map(({ to, key }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {t.nav[key]}
                </NavLink>
              ))}
            </nav>
            <LanguageToggle />
          </div>

          {/* Mobile: language toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              className="p-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-2 gap-1">
            {NAV_ROUTES.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                  }`
                }
              >
                {t.nav[key]}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="bg-white rounded-md inline-block p-2 mb-3">
              <img
                src="/logo.jpg"
                alt="PHI Lab — Precision & Provenance Health Informatics Lab, Catholic University of Korea"
                className="h-9 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{f.tagline}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{f.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              {NAV_ROUTES.map(({ to, key }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {t.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{f.contact}</h3>
            <address className="not-italic text-sm text-gray-400 space-y-1">
              <p>{f.profName}</p>
              <p>{f.department}</p>
              <p className="mt-2">
                <a
                  href={`mailto:${f.email}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {f.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {f.copyright}
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
