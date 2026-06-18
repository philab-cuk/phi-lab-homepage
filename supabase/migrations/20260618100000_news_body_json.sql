-- News 본문을 Posts 와 동일한 리치 에디터(BlockNote)로 전환하기 위해
-- body_json(블록 배열) 컬럼 추가. 격자 커버는 본문 첫 image 블록에서 뽑는다.
-- 기존 body_short/images 컬럼은 데이터 보존 위해 남겨두되 앱에서 더는 안 쓴다.
-- (운영 news 는 행 0건이라 이 마이그레이션만 적용하면 됨)
alter table public.news add column if not exists body_json jsonb;
comment on column public.news.body_json is 'BlockNote 블록 배열 본문 (Posts 와 동일 형식)';
