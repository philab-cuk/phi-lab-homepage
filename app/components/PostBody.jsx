import { useMemo } from 'react'
import { BlockNoteEditor } from '@blocknote/core'
import '@blocknote/core/style.css'

// posts/news 의 body_json(BlockNote 블록 배열)을 HTML 로 변환해 그리는 공용 부품.
// 공개 상세 페이지와 admin 미리보기가 이 하나를 공유한다.
//
// blocksToFullHTML + 코어 style.css(약 17KB) 를 써서 admin 편집기와 "똑같은"
// 모양으로 렌더한다(색·정렬·체크박스·코드블록 등 서식 보존). 무거운 mantine
// UI css(툴바·메뉴) 는 안 싣는다 — 코어 스타일만.

let converter = null
function getConverter() {
  if (!converter) converter = BlockNoteEditor.create()
  return converter
}

export default function PostBody({ json }) {
  // blocksToFullHTML 은 @blocknote/core 0.51 에서 "동기" 함수다(Promise 아님).
  const html = useMemo(() => {
    if (!Array.isArray(json) || !json.length) return ''
    try {
      return getConverter().blocksToFullHTML(json)
    } catch {
      return '' // 변환 실패해도 페이지는 살아있게
    }
  }, [json])

  if (!html) return null
  // bn-editor / bn-default-styles: 코어 css 의 글꼴·여백 규칙이 먹는 래퍼.
  // dangerouslySetInnerHTML 허용 근거: 작성자는 RLS 로 화이트리스트 멤버 제한 +
  // HTML 은 BlockNote 스키마를 거쳐 생성된다.
  return (
    <div
      className="post-body bn-editor bn-default-styles"
      data-color-scheme="light"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
