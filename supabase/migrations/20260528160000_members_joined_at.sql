-- members 에 연구실 합류일(joined_at) 추가.
-- 멤버 정렬 기준으로 사용한다. 새 멤버는 앱에서 필수 입력.
-- 기존 행은 NULL 로 남고, 정렬 시 NULL 을 맨 앞(창립 멤버)으로 두어
-- 현재 표시 순서(display_order)를 유지한다.
alter table public.members add column if not exists joined_at date;
comment on column public.members.joined_at is '연구실 합류일 (멤버 정렬 기준)';
