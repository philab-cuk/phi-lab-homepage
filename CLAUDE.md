# PHI Lab homepage — 프로젝트 규칙

## DB 변경 규칙 (반드시 지킬 것)

로컬 Supabase 스택을 직접 손대다 마이그레이션 파일을 빠뜨려 운영 반영이 누락된 사고가 있었음. 재발 방지를 위해 아래를 강제한다.

1. **직접 ALTER 금지 — 스키마 변경은 마이그레이션 파일로 먼저.**
   `docker exec ... psql -c "ALTER TABLE ..."` 같은 즉석 스키마 변경을 하지 않는다.
   `supabase/migrations/` 에 SQL 파일을 먼저 만들고(`alter table ... add column if not exists ...` 형태), 그 SQL 을 로컬 DB에 1회만 적용한다. 파일과 DB가 항상 같이 간다.

2. **커밋 전 스키마 드리프트 0 확인.**
   `supabase db diff` 를 돌려 출력이 "No schema changes found" 인지 확인한다. "파일엔 없는데 DB에만 있는 변경"이 남아 있으면 커밋하지 않는다.

3. **데이터(콘텐츠) 변경은 멱등 시드 스크립트로.**
   역할·이름 등 콘텐츠성 데이터 변경은 즉석 SQL 대신 `scripts/seed-*.mjs` 멱등 스크립트로 작성한다(여러 번 실행해도 동일). 운영에도 그 스크립트로 반영한다.

4. **`supabase db reset` 사용 금지.**
   로컬 DB에는 마이그레이션에 없는 데이터(시드·콘텐츠)가 직접 들어 있어, reset 하면 전부 사라진다. 절대 쓰지 않는다.

## 검증/테스트
- UI 변경은 `pnpm build` 통과 + Playwright(MCP)로 실제 화면 확인.
- 검증할 때 실제 운영/실데이터 레코드를 테스트용으로 수정하지 않는다. 임시 더미를 만들어 쓰고 끝나면 지운다.
