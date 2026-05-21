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
