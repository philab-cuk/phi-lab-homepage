import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function ToolbarButton({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '0.3rem 0.6rem',
        background: active ? '#222' : '#fff',
        color: active ? '#fff' : '#222',
        border: '1px solid #ccc',
        cursor: 'pointer',
        fontSize: '0.8rem',
        minWidth: '2rem',
      }}
    >
      {children}
    </button>
  )
}

/**
 * TipTap 기반 rich text editor.
 * - value/onChange: body_json (Tiptap doc JSON) 또는 null
 * - bucket: 이미지 업로드 대상 Storage 버킷 (post-images / page-images / news-images)
 * - entityKey: 폴더 prefix (id/slug 등). 미지정 시 '_temp'
 */
export default function RichTextEditor({ value, onChange, bucket = 'post-images', entityKey = '_temp' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || null,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const incoming = JSON.stringify(value || null)
    if (current !== incoming && value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return <div>에디터 로드 중…</div>

  async function uploadImage(file) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${entityKey}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
    })
    if (error) {
      alert('업로드 실패: ' + error.message)
      return null
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleImagePick() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const url = await uploadImage(file)
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
    input.click()
  }

  function setLink() {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev || '')
    if (url === null) return
    if (url === '') return editor.chain().focus().unsetLink().run()
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div style={{ border: '1px solid #ccc', background: '#fff' }}>
      <div style={{ display: 'flex', gap: 2, padding: 4, borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• list</ToolbarButton>
        <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. list</ToolbarButton>
        <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ ”</ToolbarButton>
        <ToolbarButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>&lt;code&gt;</ToolbarButton>
        <ToolbarButton active={editor.isActive('link')} onClick={setLink}>link</ToolbarButton>
        <ToolbarButton onClick={handleImagePick}>image</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>undo</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>redo</ToolbarButton>
      </div>
      <div style={{ padding: '0.75rem', minHeight: 180, fontSize: '0.9rem' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
