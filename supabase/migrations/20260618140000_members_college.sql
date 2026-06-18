-- members 에 학부/단과대학(college) 컬럼 추가.
-- (로컬 DB에는 직접 ALTER 로 먼저 들어가 있던 것을 마이그레이션으로 정식화 — 드리프트 해소)
alter table public.members add column if not exists college text;
comment on column public.members.college is '학부/단과대학 (자유 입력)';
