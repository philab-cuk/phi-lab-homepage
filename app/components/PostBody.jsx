import { useMemo } from 'react'
import { BlockNoteEditor } from '@blocknote/core'

// posts.body_json(BlockNote 블록 배열)을 HTML 로 변환해 그리는 공용 부품.
// 공개 상세 페이지와 admin 미리보기가 이 하나를 공유한다.
//
// 의도: 공개 페이지에 BlockNote UI/CSS 를 싣지 않는다 — headless 에디터로
// blocksToHTMLLossy(시맨틱 HTML: p/h2/ul/li/img/blockquote/table)만 뽑아서
// 사이트 전역 본문 스타일(.post-body)이 그대로 먹게 한다.

// 변환용 headless 에디터 — 처음 쓸 때 1개만 만들어 재사용(렌더마다 생성 금지).
let converter = null
function getConverter() {
  if (!converter) converter = BlockNoteEditor.create()
  return converter
}

export default function PostBody({ json }) {
  // blocksToHTMLLossy 는 @blocknote/core 0.51 에서 "동기" 함수다 — Promise 로
  // 다루면 .then 에서 TypeError 로 페이지가 죽는다(검증에서 잡힌 버그).
  const html = useMemo(() => {
    // body_json 은 블록 배열이어야 한다. null/옛 TipTap 형식({type:'doc'})은 빈 렌더.
    if (!Array.isArray(json) || !json.length) return ''
    try {
      return getConverter().blocksToHTMLLossy(json)
    } catch {
      return '' // 변환 실패해도 페이지는 살아있게
    }
  }, [json])

  if (!html) return null
  // dangerouslySetInnerHTML 허용 근거: 본문 작성자는 RLS 로 화이트리스트
  // 멤버(admin_users)로 제한되고, HTML 은 BlockNote 스키마를 거쳐 생성된다.
  return <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
}
