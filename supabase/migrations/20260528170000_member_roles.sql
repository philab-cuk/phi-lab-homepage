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
