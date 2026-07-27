// 구성원 외부 링크 — 값이 있는 항목만 버튼으로 표시한다.
// (이메일 · 개인 홈페이지 · Google Scholar · LinkedIn)

// admin 에 프로토콜 없이 저장된 값이 실제로 있다(예: 'www.example.com').
// 그대로 href 에 넣으면 상대경로로 해석돼 사이트 안쪽(/members/www.example.com)으로
// 잘못 이동하므로 https:// 를 붙여준다.
export function normalizeUrl(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  return `https://${s}`
}

const SVG = {
  className: 'block',
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
}

// 아이콘별 색 — 이메일(가대 네이비) · 집(따뜻한 갈색) · Scholar(구글 블루) · LinkedIn(브랜드 블루)
const C_MAIL = '#0c2e86'
const C_HOME = '#8b5e34'
const C_SCHOLAR = '#4285f4'
const C_LINKEDIN = '#0a66c2'

function MailIcon() {
  return (
    <svg {...SVG} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.2" />
      <path d="m3.6 7.2 8.4 5.9 8.4-5.9" />
    </svg>
  )
}

// 집 — 개인 홈페이지
function HomeIcon() {
  return (
    <svg {...SVG} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.2 10.6 12 3.4l8.8 7.2" />
      <path d="M5.5 9.7V20h13V9.7" />
      <path d="M9.8 20v-5.4h4.4V20" />
    </svg>
  )
}

// 학사모 — Google Scholar
function ScholarIcon() {
  return (
    <svg {...SVG} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 2.6 9 12 14l9.4-5L12 4z" />
      <path d="M6.6 11.3V16c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5v-4.7" />
    </svg>
  )
}

// LinkedIn — 모서리 둥근 사각형에 'in' 을 파낸 형태.
// 사각형과 글자를 각각 그리면 채우기 규칙에 따라 통째로 칠해질 수 있어,
// evenodd 로 글자가 확실히 뚫리게 한다.
function LinkedInIcon() {
  return (
    <svg {...SVG} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.2 2h15.6C21 2 22 3 22 4.2v15.6c0 1.2-1 2.2-2.2 2.2H4.2C3 22 2 21 2 19.8V4.2C2 3 3 2 4.2 2zm.6 7.9h2.9v9.3H4.8V9.9zm1.45-4.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zM9.5 9.9h2.8v1.27h.04c.39-.7 1.34-1.45 2.76-1.45 2.95 0 3.5 1.9 3.5 4.38v5.1h-2.9v-4.52c0-1.08-.02-2.47-1.53-2.47-1.53 0-1.77 1.17-1.77 2.39v4.6H9.5V9.9z"
      />
    </svg>
  )
}

// 네 버튼이 한 세트로 보이도록 크기·모서리·테두리·틴트를 공유하고, 색만 바꾼다.
const BTN =
  'inline-flex h-[36px] w-[36px] items-center justify-center rounded-md border p-0 no-underline ' +
  'transition-all hover:-translate-y-px hover:brightness-95'

const btnStyle = (color) => ({
  color,
  backgroundColor: `${color}14`,   // 8% 틴트
  borderColor: `${color}3d`,       // 24% 테두리
})

// 이메일은 mailto: 링크를 HTML 에 남기지 않는다 — 스팸 수집기는 대부분 mailto 와
// 'a@b' 패턴을 긁어간다. 클릭한 순간에만 주소를 조립해 메일 앱을 연다.
function EmailButton({ email }) {
  return (
    <button
      type="button"
      title="Email"
      aria-label="Email"
      onClick={() => {
        const [user, domain] = String(email).split('@')
        if (user && domain) window.location.href = `mailto:${user}@${domain}`
      }}
      className={`${BTN} cursor-pointer`}
      style={btnStyle(C_MAIL)}
    >
      <MailIcon />
    </button>
  )
}

export default function SocialLinks({ member, showEmail = true, className = '' }) {
  const links = [
    member.personalSite && { key: 'site', label: 'Personal site', Icon: HomeIcon, color: C_HOME, href: normalizeUrl(member.personalSite) },
    member.googleScholar && { key: 'gs', label: 'Google Scholar', Icon: ScholarIcon, color: C_SCHOLAR, href: normalizeUrl(member.googleScholar) },
    member.linkedin && { key: 'li', label: 'LinkedIn', Icon: LinkedInIcon, color: C_LINKEDIN, href: normalizeUrl(member.linkedin) },
  ].filter((l) => l && l.href)

  const email = showEmail ? member.email : null
  if (!email && links.length === 0) return null

  return (
    <p className={`my-2.5 flex flex-wrap items-center gap-2 ${className}`}>
      {email && <EmailButton email={email} />}
      {links.map(({ key, label, href, color, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          aria-label={label}
          className={BTN}
          style={btnStyle(color)}
        >
          <Icon />
        </a>
      ))}
    </p>
  )
}
