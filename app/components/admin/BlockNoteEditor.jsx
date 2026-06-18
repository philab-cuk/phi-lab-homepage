import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { supabase } from '../../lib/supabase'

/**
 * BlockNote(노션 스타일) 본문 편집기 — posts 전용.
 * - value: 블록 배열(body_json) 또는 null(빈 문서로 시작)
 * - onChange: 편집할 때마다 editor.document(블록 배열)를 그대로 넘김
 *   → body_json 형식은 "블록 배열"이다 (옛 TipTap {type:'doc'} 형식과
 *     Array.isArray 로 구분 가능)
 * - entityKey: 이미지 업로드 폴더 prefix (post id 등, 미지정 시 '_temp')
 *
 * 이 파일의 css import(mantine 스타일)는 AdminPosts 에서만 불려서
 * admin 라우트 청크에만 포함된다 — 공개 페이지 무게에 영향 없음.
 */
export default function BlockNoteEditor({ value, onChange, entityKey = '_temp' }) {
  const editor = useCreateBlockNote({
    initialContent: Array.isArray(value) && value.length ? value : undefined,
    uploadFile: async (file) => {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('jpg/png/webp 만 허용')
      if (file.size > 10 * 1024 * 1024) throw new Error('10MB 초과')
      const path = `${entityKey}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(path, file, { contentType: file.type })
      if (error) throw new Error('업로드 실패: ' + error.message)
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      return data.publicUrl
    },
  })

  return (
    <div
      style={{ border: '1px solid #ccc', background: '#fff', minHeight: 380, padding: '0.5rem 0', cursor: 'text' }}
      onClick={() => {
        // 글 아래 빈 공간을 클릭해도 에디터에 포커스가 잡히게 (노션과 같은 동작).
        // 실제 입력 영역은 글 높이만큼이라, 이 처리가 없으면 포커스가 body 로
        // 빠져 타이핑이 안 되고 Vimium 같은 키보드 확장이 발동한다.
        if (!document.activeElement?.isContentEditable) editor.focus()
      }}
    >
      <BlockNoteView
        editor={editor}
        theme="light"
        onChange={() => onChange?.(editor.document)}
      />
    </div>
  )
}
