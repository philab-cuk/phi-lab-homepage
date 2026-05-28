-- 협력 기관 로고 이미지 URL. 홈 "Collaborating Institutions" 로고 그리드에 사용.
alter table public.institutions add column if not exists logo_url text;
comment on column public.institutions.logo_url is '기관 로고 이미지 URL (page-images 버킷)';
