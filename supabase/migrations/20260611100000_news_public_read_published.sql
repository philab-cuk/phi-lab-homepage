-- 공개 News 페이지용: 로그아웃 방문자(anon)는 발행된(published) 소식만 읽기 허용.
-- 초기 스키마에서 news 는 authenticated 전용 읽기였음 — draft 보호를 위해
-- anon 에게는 published 만 연다. (작성/수정/삭제 정책은 변경 없음)
drop policy if exists "news: public read published" on public.news;
create policy "news: public read published" on public.news
  for select to anon using (status = 'published');
