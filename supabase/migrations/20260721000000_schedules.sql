-- =============================================================================
-- Schedules — 로그인 구성원 전용 공유 캘린더
-- =============================================================================
-- 공개 사이트 콘텐츠(news/gallery/posts)와 달리 '로그인한 화이트리스트 구성원'
-- 에게만 보인다. anon 정책을 아예 만들지 않으므로 비로그인 방문자에게는 데이터가
-- 내려가지 않는다.
--
-- 권한 (사용자 확정):
--   조회      화이트리스트 구성원 전원 (서로의 일정을 봄, 비공개 옵션 없음)
--   등록      본인 명의로만
--   수정·삭제 본인 일정 또는 에디터(admin·professor)
--
-- 날짜는 timestamptz 가 아니라 date 다. KST(UTC+9) 환경에서 timestamptz 를 쓰면
-- 자정 근처 일정이 하루 밀려 보이는 문제가 생기는데, 종일 일정만 다루므로
-- date 로 저장하고 앱에서 'YYYY-MM-DD' 문자열로 다루면 시간대 함정이 사라진다.
--
-- 여러 날 일정은 starts_on ~ ends_on 으로 표현하고, 달력에서는 기간 내 각 날짜에
-- 반복 표시한다(막대 렌더링은 1단계 제외). 반복 일정(매주 랩미팅)도 1단계 제외.
--
-- 멱등: create if not exists + drop policy if exists 로 재실행해도 안전.

create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  -- 달력 색상 구분. 앱의 카테고리 목록과 반드시 함께 바뀌어야 한다.
  category    text not null default 'lab_meeting'
              check (category in ('conference', 'paper', 'project', 'external', 'lab_meeting', 'education', 'personal')),
  starts_on   date not null,
  ends_on     date,                    -- null 이면 하루짜리
  owner_email text references public.admin_users(email) on delete set null,
  owner_name  text,                    -- 표시용 복사(anon 이 admin_users 를 못 읽는 posts.author_name 과 동일 방식)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint schedules_range_valid check (ends_on is null or ends_on >= starts_on)
);

-- 월 단위 조회(그 달과 겹치는 일정)를 위한 인덱스.
create index if not exists schedules_range_idx on public.schedules (starts_on, ends_on);
create index if not exists schedules_owner_idx on public.schedules (owner_email);

comment on table  public.schedules            is '연구실 공유 일정 — 로그인 구성원 전용';
comment on column public.schedules.category   is 'conference(학회) · paper(논문) · project(프로젝트) · external(외부미팅) · lab_meeting(랩미팅) · personal(개인일정/부재중)';
comment on column public.schedules.ends_on    is '여러 날 일정의 종료일. null 이면 starts_on 하루짜리';
comment on column public.schedules.owner_name is '작성자 표시이름(저장 시 복사)';

alter table public.schedules enable row level security;

-- 조회: 로그인 + 화이트리스트만. anon 정책 없음 = 비로그인은 아무것도 못 본다.
drop policy if exists "schedules: whitelist read" on public.schedules;
create policy "schedules: whitelist read"
  on public.schedules for select to authenticated
  using (public.is_whitelist_member());

-- 등록: 화이트리스트 구성원이 '본인 명의로만'.
drop policy if exists "schedules: whitelist insert (owner=self)" on public.schedules;
create policy "schedules: whitelist insert (owner=self)"
  on public.schedules for insert to authenticated
  with check (
    public.is_whitelist_member()
    and owner_email = (auth.jwt() ->> 'email')
  );

-- 수정: 본인 일정 또는 에디터.
drop policy if exists "schedules: editors or owner update" on public.schedules;
create policy "schedules: editors or owner update"
  on public.schedules for update to authenticated
  using      (public.is_site_editor() or owner_email = (auth.jwt() ->> 'email'))
  with check (public.is_site_editor() or owner_email = (auth.jwt() ->> 'email'));

-- 삭제: 본인 일정 또는 에디터.
drop policy if exists "schedules: editors or owner delete" on public.schedules;
create policy "schedules: editors or owner delete"
  on public.schedules for delete to authenticated
  using (public.is_site_editor() or owner_email = (auth.jwt() ->> 'email'));

-- 테이블 레벨 권한(실제 접근 제어는 위 RLS 가 담당).
-- 20260706120000_public_schema_grants.sql 의 기본권한이 적용되지 않는 환경 대비.
grant all on table public.schedules to anon, authenticated, service_role;
