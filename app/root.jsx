import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

// ─── SEO / 소셜 공유 상수 ────────────────────────────────────────────────
// 소셜 스크래퍼(FB·카카오·트위터)는 JS 미실행 → 아래 태그는 Layout <head> 에
// 직접 넣어 정적 index.html 에 포함되게 한다.
const SITE_URL = 'https://philabcuk.org/'
const SITE_TITLE = 'PHI Lab — Precision & Provenance Health Informatics Lab'
const SITE_DESC =
  'Precision & Provenance Health Informatics Lab (PHI Lab) at The Catholic University of Korea — data-driven interdisciplinary research advancing precision medicine and digital healthcare.'
const OG_IMAGE = 'https://philabcuk.org/og-image.jpg'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ResearchOrganization',
  name: 'Precision & Provenance Health Informatics Lab',
  alternateName: 'PHI Lab',
  url: SITE_URL,
  logo: 'https://philabcuk.org/logo.jpg',
  image: OG_IMAGE,
  description: SITE_DESC,
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'The Catholic University of Korea',
    url: 'https://www.catholic.ac.kr',
  },
  founder: {
    '@type': 'Person',
    name: 'Hyo Jung Kim',
    jobTitle: 'Assistant Professor',
    email: 'hyojung.kim@catholic.ac.kr',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '43, Jibong-ro',
    addressLocality: 'Bucheon',
    addressRegion: 'Gyeonggi-do',
    postalCode: '14662',
    addressCountry: 'KR',
  },
}

export const links = () => {
  const fav = import.meta.env.BASE_URL + 'favicon.png'
  return [
    { rel: 'icon', type: 'image/png', href: fav },
    { rel: 'apple-touch-icon', href: fav },
    // 웹폰트 — UI 는 Pretendard(한글+영문 산세리프, 다이나믹 서브셋),
    // 에디토리얼 문단(인용구·본문)은 Lora(영문 세리프).
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..600;1,400..600&display=swap',
    },
  ]
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* SEO / 소셜 공유 — 정적 index.html <head> 에 포함 */}
        <title>{`${SITE_TITLE} · The Catholic University of Korea`}</title>
        <meta name="description" content={SITE_DESC} />
        <link rel="canonical" href={SITE_URL} />
        {/* 검색엔진 소유확인 — 네이버 서치어드바이저 */}
        <meta name="naver-site-verification" content="f8c21ed1841e316f16148376ad8ea841a6149aee" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PHI Lab" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />

        <Meta />
        <Links />
        {/* Google Analytics 4 (GA4) — SPA 경로 이동은 Enhanced Measurement가 추적 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0J2Z78QWDF" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-0J2Z78QWDF');`,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

// SPA 첫 로드에서 clientLoader 데이터가 오기 전 잠깐 표시.
// (SPA 모드에선 root 에만 둘 수 있다)
export function HydrateFallback() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <p className="text-muted">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
