import { NavLink, Outlet, Link, useLocation } from 'react-router'
import { useEffect, useState } from 'react'

const NAV_ROUTES = [
  { to: '/professor', label: 'Professor' },
  { to: '/publications', label: 'Publication' },
  { to: '/lectures', label: 'Lecture' },
  { to: '/research', label: 'Current Research' },
  { to: '/members', label: 'Members' },
  { to: '/news', label: 'News' },
  { to: '/posts', label: 'Posts' },
  { to: '/about', label: 'About Lab' },
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
      {/* 상단 검정 띠 — 좌: 대학명 / 우: 로그인 (full width) */}
      <div className="bg-ink text-white text-[13px]">
        <div className="px-6 py-1.5 flex items-center justify-between">
          <a href="https://www.catholic.ac.kr" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white no-underline">
            가톨릭대학교
          </a>
          <Link to="/admin/login" className="text-white/90 hover:text-white no-underline">
            로그인
          </Link>
        </div>
      </div>

      {/* 네브바 — full width. 폭이 좁으면 메뉴가 아래 줄로 내려간다(겹침 방지). */}
      <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <Link to="/" onClick={close} className="flex items-center gap-3 no-underline shrink-0">
          <img src={import.meta.env.BASE_URL + 'logo.jpg'} alt="PHI Lab" className="h-12 w-auto max-[500px]:hidden" />
          <span className="leading-tight">
            <span className="block font-bold text-ink text-[14px] lg:text-[16px] xl:text-[18px]">가톨릭대학교 보건의료정보학 연구실</span>
            <span className="block text-meta text-[11px] lg:text-[12px] xl:text-[14px]">Precision &amp; Provenance Health Informatics Lab</span>
          </span>
        </Link>

        {/* 폭이 좁아지면 글씨·간격을 줄여 한 줄을 더 오래 유지(그래도 부족하면 wrap) */}
        <nav className="hidden md:flex gap-4 lg:gap-5 xl:gap-6 text-[14px] lg:text-[16px] xl:text-[18px] font-semibold">
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
          className="md:hidden text-[15px] font-semibold text-ink"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-label="메뉴 열기"
        >
          Menu
        </button>
      </div>

      {/* 우측 슬라이드 드로어 (md 미만). 항상 마운트하고 transform 으로 토글해
          슬라이드 애니메이션이 동작하게 한다. 닫혔을 땐 클릭 통과. */}
      <div className={`md:hidden fixed inset-0 z-50 overflow-hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[270px] max-w-[80vw] bg-white shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-rule">
            <span className="font-bold text-ink">PHI Lab</span>
            <button onClick={close} aria-label="메뉴 닫기" className="text-2xl leading-none text-meta">×</button>
          </div>
          <nav className="flex flex-col py-2 text-[17px] font-semibold">
            {NAV_ROUTES.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={close}
                className={({ isActive }) =>
                  `px-5 py-3 no-underline ${isActive ? 'text-brand-700 bg-brand-50' : 'text-ink hover:bg-[#fafafa]'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-rule mt-20">
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-[15px]">
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

      <div className="mx-auto max-w-[1200px] px-6 pb-8 text-xs text-meta">
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
