-- PHI Lab — 전체 마이그레이션 통합본 (번호 순서대로 자동 결합)
-- Supabase SQL Editor 에 이 파일 전체를 붙여넣고 Run 하세요.


-- ===================================================================
-- FILE: 20260521072910_initial_schema.sql
-- ===================================================================
-- =============================================================================
-- PHI Lab Homepage — Initial Schema (v1)
-- Migration:  20260521120000_initial_schema.sql
-- Generated:  2026-05-21
-- Scenario:   _scenario/admin/SCENARIOS.md
--
-- Sections:
--   0. Extensions
--   1. admin_users (auth whitelist)
--   2. invites (with prior-expiry trigger)
--   3. Helper functions (is_site_editor, is_whitelist_member)
--   4. Content: members
--   5. Content: publications + authors + publication_authors
--   6. Content: institutions + research + research_affiliations
--   7. Content: lectures
--   8. Content: pages
--   9. news (with ID trigger)
--  10. posts (with ID trigger)
--  11. RLS: enable + policies (all tables)
--  12. RPC: redeem_invite
--  13. Storage buckets + storage policies
-- =============================================================================


-- =============================================================================
-- 0. Extensions
-- =============================================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()


-- =============================================================================
-- 1. admin_users (auth whitelist)
-- =============================================================================
create table public.admin_users (
  email          text primary key,
  role           text not null
                 check (role in ('admin', 'professor', 'researcher', 'alumni')),
  display_name   text,
  invited_by     text references public.admin_users(email) on delete set null,
  added_at       timestamptz not null default now()
);

create index admin_users_role_idx on public.admin_users (role);


-- =============================================================================
-- 2. invites
-- =============================================================================
create table public.invites (
  token            uuid primary key default gen_random_uuid(),
  role             text not null
                   check (role in ('admin', 'professor', 'researcher', 'alumni')),
  intended_email   text not null,
  created_by       text references public.admin_users(email) on delete set null,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '7 days'),
  used_at          timestamptz,
  used_by_email    text
);

create index invites_active_idx
  on public.invites (expires_at)
  where used_at is null;

create index invites_intended_email_active_idx
  on public.invites (intended_email)
  where used_at is null;

-- 같은 이메일로 새 초대가 들어오면 기존 활성 초대 자동 만료
create or replace function public.expire_prior_invites_for_email()
returns trigger
language plpgsql
as $$
begin
  update public.invites
  set expires_at = now()
  where intended_email = new.intended_email
    and used_at is null
    and expires_at > now()
    and token <> new.token;
  return new;
end;
$$;

create trigger trg_expire_prior_invites
  after insert on public.invites
  for each row execute function public.expire_prior_invites_for_email();


-- =============================================================================
-- 3. Helper functions for RLS (SECURITY DEFINER 로 RLS 우회)
-- =============================================================================
create or replace function public.is_site_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt()->>'email')
      and role in ('admin', 'professor')
  );
$$;

create or replace function public.is_whitelist_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (auth.jwt()->>'email')
  );
$$;

grant execute on function public.is_site_editor()      to authenticated;
grant execute on function public.is_whitelist_member() to authenticated;


-- =============================================================================
-- 4. members
-- =============================================================================
create table public.members (
  id                  text primary key,
  name                text not null,
  name_ko             text,
  role                text not null,
  title               text,
  degree              text,
  student_number      text,
  department          text,
  institution         text,
  photo_url           text,
  email               text,
  personal_site       text,
  linkedin            text,
  google_scholar      text,
  research_interests  text[],
  bio_short           text,
  bio_full            text,
  education           jsonb,
  experience          jsonb,
  service             text[],
  status              text not null check (status in ('current', 'alumni')),
  display_order       int  not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index members_status_order_idx on public.members (status, display_order);


-- =============================================================================
-- 5. publications + authors + publication_authors
-- =============================================================================
create table public.publications (
  id              text primary key,
  category        text not null
                  check (category in ('article', 'international-presentation', 'national-presentation')),
  title           text not null,
  venue           text,
  venue_details   text,
  location        text,
  date            text,
  year            int  not null,
  doi             text,
  url             text,
  featured        boolean not null default false,
  display_order   int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index publications_category_year_order_idx
  on public.publications (category, year desc, display_order, date desc);

create index publications_featured_idx
  on public.publications (featured) where featured = true;

create table public.authors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  full_name     text,
  member_id     text references public.members(id) on delete set null,
  affiliation   text,
  created_at    timestamptz not null default now()
);

create index authors_name_idx      on public.authors (name);
create index authors_member_id_idx on public.authors (member_id) where member_id is not null;

create table public.publication_authors (
  publication_id   text not null references public.publications(id) on delete cascade,
  author_id        uuid not null references public.authors(id) on delete restrict,
  position         int  not null,
  is_pi            boolean not null default false,
  is_co_first      boolean not null default false,
  is_co_correspond boolean not null default false,
  primary key (publication_id, position)
);

create index publication_authors_author_idx on public.publication_authors (author_id);


-- =============================================================================
-- 6. institutions + research + research_affiliations
-- =============================================================================
create table public.institutions (
  id           uuid primary key default gen_random_uuid(),
  name_en      text not null unique,
  name_ko      text,
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.research (
  id               text primary key,
  title            text not null,
  full_title       text,
  description_ko   text,
  tags             text[],
  tags_featured    text[],
  collaborators    jsonb,
  notes            text,
  funding_agency   text,
  featured         boolean not null default false,
  status           text not null default 'active'
                   check (status in ('active', 'completed')),
  display_order    int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index research_status_order_idx on public.research (status, display_order);
create index research_featured_idx     on public.research (featured) where featured = true;

create table public.research_affiliations (
  research_id      text not null references public.research(id)        on delete cascade,
  institution_id   uuid not null references public.institutions(id)    on delete restrict,
  department_en    text,
  department_ko    text,
  position         int  not null default 0,
  primary key (research_id, position)
);

create index research_affiliations_institution_idx
  on public.research_affiliations (institution_id);


-- =============================================================================
-- 7. lectures
-- =============================================================================
create table public.lectures (
  id             text primary key,
  code           text,
  title_en       text not null,
  title_ko       text,
  semester       text not null,
  year           int  not null,
  term           text not null check (term in ('Spring', 'Summer', 'Fall', 'Winter')),
  level          text not null check (level in ('undergraduate', 'graduate')),
  language       text,
  description    text,
  objectives     text[],
  images         text[],
  tags           text[],
  display_order  int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index lectures_year_term_idx on public.lectures (year desc, term);
create index lectures_level_idx     on public.lectures (level);


-- =============================================================================
-- 8. pages
-- =============================================================================
create table public.pages (
  slug          text primary key,
  title         text,
  body_json     jsonb,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  updated_by    text references public.admin_users(email) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- =============================================================================
-- 9. news (with ID trigger)
-- =============================================================================
create table public.news (
  id            text primary key,
  title         text not null,
  body_short    text,
  images        jsonb not null default '[]'::jsonb,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  author_email  text references public.admin_users(email) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index news_published_idx
  on public.news (published_at desc) where status = 'published';

create index news_author_idx on public.news (author_email);

create or replace function public.assign_news_id()
returns trigger
language plpgsql
as $$
declare
  v_date_prefix text := to_char(current_date, 'YYYY-MM-DD');
  v_seq int;
begin
  if new.id is not null and new.id <> '' then
    return new;
  end if;

  select coalesce(max(substring(id from '(\d+)$')::int), 0) + 1
  into v_seq
  from public.news
  where id like v_date_prefix || '-%';

  new.id := v_date_prefix || '-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;

create trigger trg_assign_news_id
  before insert on public.news
  for each row execute function public.assign_news_id();


-- =============================================================================
-- 10. posts (with ID trigger)
-- =============================================================================
create table public.posts (
  id            text primary key,
  title         text not null,
  body_json     jsonb,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  author_email  text references public.admin_users(email) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index posts_published_idx
  on public.posts (published_at desc) where status = 'published';

create index posts_author_idx on public.posts (author_email);

create or replace function public.assign_post_id()
returns trigger
language plpgsql
as $$
declare
  v_date_prefix text := to_char(current_date, 'YYYY-MM-DD');
  v_seq int;
begin
  if new.id is not null and new.id <> '' then
    return new;
  end if;

  select coalesce(max(substring(id from '(\d+)$')::int), 0) + 1
  into v_seq
  from public.posts
  where id like v_date_prefix || '-%';

  new.id := v_date_prefix || '-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;

create trigger trg_assign_post_id
  before insert on public.posts
  for each row execute function public.assign_post_id();


-- =============================================================================
-- 11. RLS: enable + policies
-- =============================================================================

-- ----- admin_users -----
alter table public.admin_users enable row level security;

create policy "admin_users: self read"
  on public.admin_users for select to authenticated
  using (email = (auth.jwt()->>'email'));

create policy "admin_users: editors read all"
  on public.admin_users for select to authenticated
  using (public.is_site_editor());

create policy "admin_users: editors insert"
  on public.admin_users for insert to authenticated
  with check (public.is_site_editor());

create policy "admin_users: editors update"
  on public.admin_users for update to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());

create policy "admin_users: editors delete"
  on public.admin_users for delete to authenticated
  using (public.is_site_editor());

-- ----- invites -----
alter table public.invites enable row level security;

create policy "invites: editors all"
  on public.invites for all to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());

-- ----- Content tables (site editors only) -----
-- members / publications / authors / publication_authors /
-- research / institutions / research_affiliations / lectures / pages
do $$
declare
  t text;
begin
  foreach t in array array[
    'members','publications','authors','publication_authors',
    'research','institutions','research_affiliations',
    'lectures','pages'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format($f$
      create policy "%s: authenticated read"
        on public.%I for select to authenticated using (true);
    $f$, t, t);

    execute format($f$
      create policy "%s: editors write"
        on public.%I for all to authenticated
        using (public.is_site_editor()) with check (public.is_site_editor());
    $f$, t, t);
  end loop;
end$$;

-- ----- news -----
alter table public.news enable row level security;

create policy "news: authenticated read"
  on public.news for select to authenticated using (true);

create policy "news: whitelist insert (author=self)"
  on public.news for insert to authenticated
  with check (
    public.is_whitelist_member()
    and author_email = (auth.jwt()->>'email')
  );

create policy "news: editors or self update"
  on public.news for update to authenticated
  using      (public.is_site_editor() or author_email = (auth.jwt()->>'email'))
  with check (public.is_site_editor() or author_email = (auth.jwt()->>'email'));

create policy "news: editors or self delete"
  on public.news for delete to authenticated
  using (public.is_site_editor() or author_email = (auth.jwt()->>'email'));

-- ----- posts (CSR: anon SELECT published) -----
alter table public.posts enable row level security;

create policy "posts: anon read published"
  on public.posts for select to anon
  using (status = 'published');

create policy "posts: authenticated read all"
  on public.posts for select to authenticated using (true);

create policy "posts: whitelist insert (author=self)"
  on public.posts for insert to authenticated
  with check (
    public.is_whitelist_member()
    and author_email = (auth.jwt()->>'email')
  );

create policy "posts: editors or self update"
  on public.posts for update to authenticated
  using      (public.is_site_editor() or author_email = (auth.jwt()->>'email'))
  with check (public.is_site_editor() or author_email = (auth.jwt()->>'email'));

create policy "posts: editors or self delete"
  on public.posts for delete to authenticated
  using (public.is_site_editor() or author_email = (auth.jwt()->>'email'));


-- =============================================================================
-- 12. RPC: redeem_invite
-- =============================================================================
create or replace function public.redeem_invite(invite_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite      public.invites%rowtype;
  v_email       text;
  v_already_in  boolean;
begin
  v_email := lower(auth.jwt()->>'email');
  if v_email is null or v_email = '' then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite
  from public.invites
  where token = invite_token
  for update;

  if not found then
    raise exception 'invalid_invite';
  end if;

  if v_invite.used_at is not null then
    raise exception 'invite_already_used';
  end if;

  if v_invite.expires_at < now() then
    raise exception 'invite_expired';
  end if;

  if lower(v_invite.intended_email) <> v_email then
    raise exception 'invite_email_mismatch';
  end if;

  select exists(
    select 1 from public.admin_users where email = v_email
  ) into v_already_in;

  if v_already_in then
    update public.invites
      set used_at = now(), used_by_email = v_email
      where token = invite_token;

    return json_build_object(
      'success', true,
      'already_member', true,
      'email', v_email,
      'role', (select role from public.admin_users where email = v_email)
    );
  end if;

  insert into public.admin_users (email, role, invited_by)
  values (v_email, v_invite.role, v_invite.created_by);

  update public.invites
    set used_at = now(), used_by_email = v_email
    where token = invite_token;

  return json_build_object(
    'success', true,
    'already_member', false,
    'email', v_email,
    'role', v_invite.role
  );
end;
$$;

revoke all on function public.redeem_invite(uuid) from public;
grant execute on function public.redeem_invite(uuid) to authenticated;


-- =============================================================================
-- 13. Storage buckets + storage.objects policies
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('profile-photos', 'profile-photos', true, 10485760,
   array['image/jpeg','image/png','image/webp']),
  ('news-images',    'news-images',    true, 10485760,
   array['image/jpeg','image/png','image/webp']),
  ('post-images',    'post-images',    true, 10485760,
   array['image/jpeg','image/png','image/webp']),
  ('page-images',    'page-images',    true, 10485760,
   array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- 공개 읽기 (4 버킷 모두)
create policy "storage: public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('profile-photos','news-images','post-images','page-images'));

-- profile-photos / page-images: site editors only
create policy "storage: editors write site-images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('profile-photos','page-images')
    and public.is_site_editor()
  );

create policy "storage: editors update site-images"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('profile-photos','page-images')
    and public.is_site_editor()
  );

create policy "storage: editors delete site-images"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('profile-photos','page-images')
    and public.is_site_editor()
  );

-- news-images / post-images: 화이트리스트 전원
create policy "storage: whitelist write content-images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('news-images','post-images')
    and public.is_whitelist_member()
  );

create policy "storage: whitelist update content-images"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('news-images','post-images')
    and public.is_whitelist_member()
  );

create policy "storage: whitelist delete content-images"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('news-images','post-images')
    and public.is_whitelist_member()
  );

-- =============================================================================
-- END
-- =============================================================================


-- ===================================================================
-- FILE: 20260521080000_advisor_followups.sql
-- ===================================================================
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


-- ===================================================================
-- FILE: 20260528025050_public_read_for_anon.sql
-- ===================================================================
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


-- ===================================================================
-- FILE: 20260528153750_members_self_edit.sql
-- ===================================================================
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


-- ===================================================================
-- FILE: 20260528160000_members_joined_at.sql
-- ===================================================================
-- members 에 연구실 합류일(joined_at) 추가.
-- 멤버 정렬 기준으로 사용한다. 새 멤버는 앱에서 필수 입력.
-- 기존 행은 NULL 로 남고, 정렬 시 NULL 을 맨 앞(창립 멤버)으로 두어
-- 현재 표시 순서(display_order)를 유지한다.
alter table public.members add column if not exists joined_at date;
comment on column public.members.joined_at is '연구실 합류일 (멤버 정렬 기준)';


-- ===================================================================
-- FILE: 20260528170000_member_roles.sql
-- ===================================================================
-- 멤버 역할(Role) 목록 표. 관리 화면에서 추가/이름변경/삭제하고,
-- 멤버 폼의 Role 드롭다운이 이 목록을 따른다.
-- members.role 은 계속 라벨 텍스트를 저장한다(이 표를 참조하는 FK 는 두지 않음).
-- "Principal Investigator" 라벨은 교수 구분에 쓰이므로 보존 권장(추후 플래그로 개선).
create table if not exists public.member_roles (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.member_roles enable row level security;

-- 읽기: 드롭다운용. anon 포함(민감하지 않음).
drop policy if exists "member_roles: public read" on public.member_roles;
create policy "member_roles: public read" on public.member_roles
  for select to anon, authenticated using (true);

-- 쓰기: editor(admin/professor)만.
drop policy if exists "member_roles: editor write" on public.member_roles;
create policy "member_roles: editor write" on public.member_roles
  for all to authenticated
  using (public.is_site_editor()) with check (public.is_site_editor());

-- 현재 쓰는 역할 시드.
insert into public.member_roles (label, sort_order) values
  ('Principal Investigator', 10),
  ('Undergraduate Researcher', 20)
on conflict (label) do nothing;


-- ===================================================================
-- FILE: 20260528180000_lecture_images_bucket.sql
-- ===================================================================
-- 강의 사진(여러 장) 저장용 storage 버킷. 공개 읽기 + editor 쓰기.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('lecture-images', 'lecture-images', true, 10485760,
   array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "storage: public read lecture-images" on storage.objects;
create policy "storage: public read lecture-images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'lecture-images');

drop policy if exists "storage: editors write lecture-images" on storage.objects;
create policy "storage: editors write lecture-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'lecture-images' and public.is_site_editor());

drop policy if exists "storage: editors update lecture-images" on storage.objects;
create policy "storage: editors update lecture-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'lecture-images' and public.is_site_editor());

drop policy if exists "storage: editors delete lecture-images" on storage.objects;
create policy "storage: editors delete lecture-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'lecture-images' and public.is_site_editor());


-- ===================================================================
-- FILE: 20260528190000_institutions_logo.sql
-- ===================================================================
-- 협력 기관 로고 이미지 URL. 홈 "Collaborating Institutions" 로고 그리드에 사용.
alter table public.institutions add column if not exists logo_url text;
comment on column public.institutions.logo_url is '기관 로고 이미지 URL (page-images 버킷)';


-- ===================================================================
-- FILE: 20260528191000_page_images_allow_svg.sql
-- ===================================================================
-- 기관 로고 등 SVG 업로드 허용. page-images 버킷 허용 MIME 에 svg 추가.
-- (운영에는 직접 적용했었으나 마이그레이션으로 누락 → 재현 가능하도록 파일화)
update storage.buckets
  set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/svg+xml']
  where id = 'page-images';


-- ===================================================================
-- FILE: 20260611100000_news_public_read_published.sql
-- ===================================================================
-- 공개 News 페이지용: 로그아웃 방문자(anon)는 발행된(published) 소식만 읽기 허용.
-- 초기 스키마에서 news 는 authenticated 전용 읽기였음 — draft 보호를 위해
-- anon 에게는 published 만 연다. (작성/수정/삭제 정책은 변경 없음)
drop policy if exists "news: public read published" on public.news;
create policy "news: public read published" on public.news
  for select to anon using (status = 'published');


-- ===================================================================
-- FILE: 20260618100000_news_body_json.sql
-- ===================================================================
-- News 본문을 Posts 와 동일한 리치 에디터(BlockNote)로 전환하기 위해
-- body_json(블록 배열) 컬럼 추가. 격자 커버는 본문 첫 image 블록에서 뽑는다.
-- 기존 body_short/images 컬럼은 데이터 보존 위해 남겨두되 앱에서 더는 안 쓴다.
-- (운영 news 는 행 0건이라 이 마이그레이션만 적용하면 됨)
alter table public.news add column if not exists body_json jsonb;
comment on column public.news.body_json is 'BlockNote 블록 배열 본문 (Posts 와 동일 형식)';


-- ===================================================================
-- FILE: 20260618130000_posts_board.sql
-- ===================================================================
-- Posts 게시판화: 조회수(views) + 공지 고정(pinned) + 익명 조회수 증가 RPC.
alter table public.posts add column if not exists views int not null default 0;
alter table public.posts add column if not exists pinned boolean not null default false;
-- 작성자 표시이름 비정규화: admin_users 는 anon 이 못 읽으므로(RLS) 저장 시 복사.
alter table public.posts add column if not exists author_name text;
comment on column public.posts.views is '상세 조회수';
comment on column public.posts.pinned is '공지 고정(목록 상단 Notice)';
comment on column public.posts.author_name is '작성자 표시이름(저장 시 admin_users.display_name 복사)';

create index if not exists posts_pinned_published_idx on public.posts (pinned desc, published_at desc) where status = 'published';

-- 익명 방문자도 조회수를 올릴 수 있도록 SECURITY DEFINER 로 published 행만 +1.
create or replace function public.increment_post_views(p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set views = views + 1 where id = p_id and status = 'published';
$$;

revoke all on function public.increment_post_views(text) from public;
grant execute on function public.increment_post_views(text) to anon, authenticated;


-- ===================================================================
-- FILE: 20260618140000_members_college.sql
-- ===================================================================
-- members 에 학부/단과대학(college) 컬럼 추가.
-- (로컬 DB에는 직접 ALTER 로 먼저 들어가 있던 것을 마이그레이션으로 정식화 — 드리프트 해소)
alter table public.members add column if not exists college text;
comment on column public.members.college is '학부/단과대학 (자유 입력)';

