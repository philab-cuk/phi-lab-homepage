-- =============================================================================
-- schedules 카테고리에 personal(개인일정/부재중) 추가
-- =============================================================================
-- 20260721000000_schedules.sql 을 이미 실행한 DB 는 category check 제약이 5종으로
-- 굳어 있다(create table if not exists 는 기존 테이블의 제약을 고치지 않음).
-- 제약을 다시 만들어 6종으로 맞춘다.
--
-- 멱등: drop constraint if exists → add constraint. 새로 만든 DB(이미 6종)에
-- 재적용해도 같은 제약이 다시 생길 뿐이라 안전하다.

alter table public.schedules
  drop constraint if exists schedules_category_check;

alter table public.schedules
  add constraint schedules_category_check
  check (category in ('conference', 'paper', 'project', 'external', 'lab_meeting', 'personal'));

comment on column public.schedules.category is
  'conference(학회) · paper(논문) · project(프로젝트) · external(외부미팅) · lab_meeting(랩미팅) · personal(개인일정/부재중)';
