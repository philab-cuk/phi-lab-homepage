-- =============================================================================
-- public 스키마 역할 권한(GRANT) 정식화.
--
-- 배경: 새 Supabase 프로젝트에 마이그레이션만으로 스키마를 세우면, public
-- 테이블에 anon/authenticated/service_role 권한이 자동으로 붙지 않는 환경이 있다
-- (기본권한 설정이 프로젝트마다 다름). 권한이 없으면:
--   - service_role 키 시드가 'permission denied' 로 막히고
--   - anon 공개 읽기(사이트 표시)도 막힌다.
-- 실제 접근 제어는 각 테이블 RLS 정책이 담당하므로, 테이블 레벨 GRANT 를
-- 표준 Supabase 구성과 동일하게 부여해도 안전하다(RLS 가 행 단위로 좁힌다).
--
-- 멱등: 이미 권한이 있는 프로젝트(예: 기존 운영 DB)에 재적용해도 no-op.
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- 이후 postgres 가 만드는 새 객체도 자동으로 같은 권한을 받도록 기본권한 설정.
alter default privileges for role postgres in schema public
  grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant all on functions to anon, authenticated, service_role;
