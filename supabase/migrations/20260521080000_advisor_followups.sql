-- =============================================================================
-- PHI Lab Homepage — Advisor Followups
-- Migration:  20260521080000_advisor_followups.sql
-- Generated:  2026-05-21
--
-- Lints addressed (Supabase database-linter):
--   - 0011 function_search_path_mutable (3 triggers)
--   - 0028 anon_security_definer_function_executable      (helper/RPC revoke)
--   - 0029 authenticated_security_definer_function_executable (intended → keep grant)
--   - 0003 auth_rls_initplan (RLS 안 auth.jwt() → (select auth.jwt()))
--   - 0006 multiple_permissive_policies
--       - admin_users: SELECT 2개 → 단일 OR 정책으로 통합
--       - 9 content tables: "editors write" FOR ALL → FOR INSERT/UPDATE/DELETE 분리
-- =============================================================================


-- 1. 함수 search_path 고정 (hijack 방지)
alter function public.expire_prior_invites_for_email() set search_path = public;
alter function public.assign_news_id()                  set search_path = public;
alter function public.assign_post_id()                  set search_path = public;


-- 2. helper/RPC 함수의 public/anon EXECUTE 회수
-- (authenticated 명시 grant 는 유지)
revoke execute on function public.is_site_editor()       from public, anon;
revoke execute on function public.is_whitelist_member()  from public, anon;
revoke execute on function public.redeem_invite(uuid)    from public, anon;


-- 3. admin_users: SELECT 2개를 단일 정책으로 통합
drop policy "admin_users: self read"        on public.admin_users;
drop policy "admin_users: editors read all" on public.admin_users;
drop policy "admin_users: editors insert"   on public.admin_users;
drop policy "admin_users: editors update"   on public.admin_users;
drop policy "admin_users: editors delete"   on public.admin_users;

create policy "admin_users: self or editors read"
  on public.admin_users for select to authenticated
  using (
    email = (select auth.jwt()->>'email')
    or public.is_site_editor()
  );

create policy "admin_users: editors insert"
  on public.admin_users for insert to authenticated
  with check (public.is_site_editor());

create policy "admin_users: editors update"
  on public.admin_users for update to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());

create policy "admin_users: editors delete"
  on public.admin_users for delete to authenticated
  using (public.is_site_editor());


-- 4. content tables: "editors write" (FOR ALL) → INSERT/UPDATE/DELETE 분리
do $split$
declare t text;
begin
  foreach t in array array[
    'members','publications','authors','publication_authors',
    'research','institutions','research_affiliations',
    'lectures','pages'
  ] loop
    execute format('drop policy if exists "%s: editors write" on public.%I', t, t);

    execute format($f$
      create policy "%s: editors insert"
        on public.%I for insert to authenticated
        with check (public.is_site_editor());
    $f$, t, t);

    execute format($f$
      create policy "%s: editors update"
        on public.%I for update to authenticated
        using (public.is_site_editor()) with check (public.is_site_editor());
    $f$, t, t);

    execute format($f$
      create policy "%s: editors delete"
        on public.%I for delete to authenticated
        using (public.is_site_editor());
    $f$, t, t);
  end loop;
end $split$;


-- 5. news: auth.jwt() InitPlan 감싸기
drop policy "news: whitelist insert (author=self)" on public.news;
drop policy "news: editors or self update"         on public.news;
drop policy "news: editors or self delete"         on public.news;

create policy "news: whitelist insert (author=self)"
  on public.news for insert to authenticated
  with check (
    public.is_whitelist_member()
    and author_email = (select auth.jwt()->>'email')
  );

create policy "news: editors or self update"
  on public.news for update to authenticated
  using      (public.is_site_editor() or author_email = (select auth.jwt()->>'email'))
  with check (public.is_site_editor() or author_email = (select auth.jwt()->>'email'));

create policy "news: editors or self delete"
  on public.news for delete to authenticated
  using (public.is_site_editor() or author_email = (select auth.jwt()->>'email'));


-- 6. posts: 동일 패턴
drop policy "posts: whitelist insert (author=self)" on public.posts;
drop policy "posts: editors or self update"         on public.posts;
drop policy "posts: editors or self delete"         on public.posts;

create policy "posts: whitelist insert (author=self)"
  on public.posts for insert to authenticated
  with check (
    public.is_whitelist_member()
    and author_email = (select auth.jwt()->>'email')
  );

create policy "posts: editors or self update"
  on public.posts for update to authenticated
  using      (public.is_site_editor() or author_email = (select auth.jwt()->>'email'))
  with check (public.is_site_editor() or author_email = (select auth.jwt()->>'email'));

create policy "posts: editors or self delete"
  on public.posts for delete to authenticated
  using (public.is_site_editor() or author_email = (select auth.jwt()->>'email'));

-- =============================================================================
-- END
-- =============================================================================
