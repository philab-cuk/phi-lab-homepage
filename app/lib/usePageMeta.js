import { useEffect } from 'react'

// 클라이언트 라우트별 메타 — 탭 제목 + description/OG 를 현재 페이지에 맞게 갱신하고,
// 페이지를 벗어나면 원래(빌드 시 구운 기본) 값으로 되돌린다.
//
// 반영 범위: 브라우저 탭 제목 + JS 를 실행하는 크롤러(구글). 즉 검색·UX 개선.
// 한계: JS 미실행 스크래퍼(카톡/네이버 미리보기 봇)는 정적 index.html 의 기본값을
//   본다 → 개별 글의 SNS 미리보기까지 바꾸려면 프리렌더가 필요.
//
// 기존 <head> 태그의 content 만 바꾸고 새 태그를 만들지 않는다(중복 방지).
const TITLE_SUFFIX = ' · PHI Lab'

const OG_TITLE_SELECTORS = ['meta[property="og:title"]', 'meta[name="twitter:title"]']
const DESC_SELECTORS = [
  'meta[name="description"]',
  'meta[property="og:description"]',
  'meta[name="twitter:description"]',
]
const IMG_SELECTORS = ['meta[property="og:image"]', 'meta[name="twitter:image"]']

function applyContent(selectors, value, restores) {
  for (const sel of selectors) {
    const el = document.head.querySelector(sel)
    if (!el) continue
    restores.push([el, el.getAttribute('content')])
    el.setAttribute('content', value)
  }
}

export function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const prevTitle = document.title
    const restores = []

    if (title) {
      const full = title.includes('PHI Lab') ? title : title + TITLE_SUFFIX
      document.title = full
      applyContent(OG_TITLE_SELECTORS, full, restores)
    }
    if (description) applyContent(DESC_SELECTORS, description, restores)
    if (image) applyContent(IMG_SELECTORS, image, restores)

    return () => {
      document.title = prevTitle
      for (const [el, prev] of restores) {
        if (prev == null) el.removeAttribute('content')
        else el.setAttribute('content', prev)
      }
    }
  }, [title, description, image])
}
