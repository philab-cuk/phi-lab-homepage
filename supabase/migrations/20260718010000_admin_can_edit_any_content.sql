-- =============================================================================
-- 관리자(화이트리스트) 구성원이면 누구나 콘텐츠를 수정·삭제할 수 있게 완화
-- =============================================================================
-- 배경: 연구실 공용 운영 — 작성자가 아니어도 admin 화면에서 잘못된 내용(예: 갤러리
--   촬영일)을 바로 고칠 수 있어야 한다. 기존 정책은 '에디터 또는 작성자 본인'이라,
--   남이 올린 항목은 UPDATE 가 0행으로 조용히 무시됐다(PostgREST 는 RLS 로 걸러진
--   update/delete 를 에러 없이 0행으로 돌려줌).
--
-- 대상: gallery / news / posts 의 UPDATE·DELETE → is_whitelist_member() 로 통일.
-- 유지: 개인 프로필(members self edit)과 에디터 전용 영역(구성원·논문·연구·강의 등)은
--   그대로 둔다. 작성자 기록(created_by / author_email)도 표시용으로 계속 남는다.
--
-- 주의: 화이트리스트 구성원이면 누구나 서로의 글·사진을 고치고 지울 수 있게 된다.
--   신뢰 그룹 전제의 설정이며, 나중에 역할별로 좁히려면 is_site_editor() 조합으로
--   되돌리면 된다.

-- ----- gallery -----
drop policy if exists "gallery: editors or creator update" on public.gallery;
drop policy if exists "gallery: whitelist update" on public.gallery;
create policy "gallery: whitelist update"
  on public.gallery for update to authenticated
  using      (public.is_whitelist_member())
  with check (public.is_whitelist_member());

drop policy if exists "gallery: editors or creator delete" on public.gallery;
drop policy if exists "gallery: whitelist delete" on public.gallery;
create policy "gallery: whitelist delete"
  on public.gallery for delete to authenticated
  using (public.is_whitelist_member());

-- ----- news -----
drop policy if exists "news: editors or self update" on public.news;
drop policy if exists "news: whitelist update" on public.news;
create policy "news: whitelist update"
  on public.news for update to authenticated
  using      (public.is_whitelist_member())
  with check (public.is_whitelist_member());

drop policy if exists "news: editors or self delete" on public.news;
drop policy if exists "news: whitelist delete" on public.news;
create policy "news: whitelist delete"
  on public.news for delete to authenticated
  using (public.is_whitelist_member());

-- ----- posts -----
drop policy if exists "posts: editors or self update" on public.posts;
drop policy if exists "posts: whitelist update" on public.posts;
create policy "posts: whitelist update"
  on public.posts for update to authenticated
  using      (public.is_whitelist_member())
  with check (public.is_whitelist_member());

drop policy if exists "posts: editors or self delete" on public.posts;
drop policy if exists "posts: whitelist delete" on public.posts;
create policy "posts: whitelist delete"
  on public.posts for delete to authenticated
  using (public.is_whitelist_member());
