-- =============================================================================
-- PHI Lab Homepage — 공개 콘텐츠 익명 읽기 허용
-- Migration: 20260528025050_public_read_for_anon.sql
--
-- 공개 페이지(로그아웃 방문자 = anon)가 콘텐츠를 읽을 수 있도록 SELECT
-- 정책을 'authenticated only' → 'anon + authenticated' 로 교체.
-- write 정책(INSERT/UPDATE/DELETE)은 그대로 — editors(admin/professor)만.
-- news 는 published 만 / posts 는 이미 anon published 열림 — 변경 없음.
-- =============================================================================

do $pub$
declare t text;
begin
  foreach t in array array[
    'members','publications','authors','publication_authors',
    'research','institutions','research_affiliations','lectures'
  ] loop
    execute format('drop policy if exists "%s: authenticated read" on public.%I', t, t);
    execute format($f$
      create policy "%s: public read" on public.%I
        for select to anon, authenticated using (true);
    $f$, t, t);
  end loop;
end$pub$;
