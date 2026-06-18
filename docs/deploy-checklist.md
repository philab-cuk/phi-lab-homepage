# 운영 반영 체크리스트 (6/19 egress 리셋 후)

> Supabase Free egress 한도가 6/19 리셋된 뒤에만 진행한다. 그 전엔 운영 DB/Storage 접근 금지.
> 실제 실행·검증은 태스크 #97에서 한다. 이 문서는 순서·명령 정의용.

## 1. 코드 push + 재배포
```bash
git log origin/main..HEAD --oneline   # 미push 커밋 확인 (없어 보이면 git fetch 후 재확인)
git push origin main
```
- Render 자동 배포 트리거 → 빌드 통과 확인(Render 대시보드 로그).

## 2. 운영 DB 마이그레이션 적용
- 먼저 운영의 현재 마이그레이션 상태 확인(supabase MCP `list_migrations` 또는 대시보드).
- 아래 중 **운영에 아직 없는 것만** 순서대로 적용:
  - `20260611100000_news_public_read_published.sql`
  - `20260618100000_news_body_json.sql`
  - `20260618130000_posts_board.sql`  (views/pinned/author_name + increment_post_views RPC)
  - `20260618140000_members_college.sql`
- 적용 후 `supabase db diff`(운영 링크) 또는 list_migrations 로 누락 없음 확인.

## 3. 데이터(콘텐츠) 시드 운영 실행
- `.env.local` 의 URL/키를 **운영용으로** 둔 환경에서:
```bash
node scripts/seed-roles-and-names.mjs   # 역할 한글 8종 + 멤버 이름(영문 결합형·한글)
```
- 멱등 스크립트라 재실행 안전. (운영 멤버의 영문 이름이 공백형이면 자동으로 결합형으로 변환됨)
- ※ 데모용 대량 시드(`seed-bulk.mjs`, `seed-test-*.mjs`)는 운영에 실행하지 말 것(테스트 데이터).

## 4. Storage / RLS 점검
- 버킷: news-images / post-images / profile-photos / page-images / lecture-images 존재·공개읽기.
- RLS: news·posts 익명은 published 만 읽기, member_roles 등 정책 정상.

## 5. 운영 화면 검증
- News 격자(커버·날짜), News 상세, Posts 게시판(공지 고정·조회수 증가), Post 상세.
- Members 한글 이름·역할(지도교수/학부연구생), Professor 페이지 이름.
- Publications 인용 줄 링크, 푸터 정렬, 네비 대문자.
- 콘솔 에러 0.
