// react-router framework 모드.
// ssr:false = SPA 모드. prerender 경로는 빌드 시점에 loader 를 실행해 정적 HTML
// 생성(브라우저 없이 Node 렌더 = 정석 SSG). admin/posts 등 비-prerender 는
// SPA fallback 으로 클라이언트 렌더.
export default {
  ssr: false,
  basename: process.env.VITE_BASE || '/',
  async prerender() {
    return ['/', '/about', '/members', '/professor', '/research', '/publications', '/lectures']
  },
}
