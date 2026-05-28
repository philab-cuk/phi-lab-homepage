-- =============================================================================
-- members 셀프 등록/수정 — 화이트리스트 user 가 본인(email) 멤버 행을 직접 관리
-- editor(admin/professor) 정책은 그대로 유지.
-- =============================================================================

-- 본인 이메일로만 insert (editor 는 누구든)
create policy "members: self insert" on public.members
  for insert to authenticated
  with check (
    public.is_site_editor()
    or email = (select auth.jwt()->>'email')
  );

-- 본인 행만 update (email 변경 불가 — with_check 으로 본인 email 고정), editor 는 전체
create policy "members: self update" on public.members
  for update to authenticated
  using (
    public.is_site_editor()
    or email = (select auth.jwt()->>'email')
  )
  with check (
    public.is_site_editor()
    or email = (select auth.jwt()->>'email')
  );
