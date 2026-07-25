-- =============================================================================
-- schedules 카테고리에 education(교육/행사) 추가 — 최종 7종
-- =============================================================================
-- category check 제약을 7종으로 다시 만든다. 앞선 마이그레이션을 이미 실행한 DB든
-- 새로 만든 DB든, 이 파일 하나만 실행하면 최종 상태가 된다.
--
-- 최종 7종:
--   conference(학회) · paper(논문) · project(프로젝트) · external(외부미팅)
--   lab_meeting(랩미팅) · education(교육/행사) · personal(개인일정/부재중)
--
-- 멱등: drop constraint if exists → add constraint.

alter table public.schedules
  drop constraint if exists schedules_category_check;

alter table public.schedules
  add constraint schedules_category_check
  check (category in ('conference', 'paper', 'project', 'external', 'lab_meeting', 'education', 'personal'));

comment on column public.schedules.category is
  'conference(학회) · paper(논문) · project(프로젝트) · external(외부미팅) · lab_meeting(랩미팅) · education(교육/행사) · personal(개인일정/부재중)';
