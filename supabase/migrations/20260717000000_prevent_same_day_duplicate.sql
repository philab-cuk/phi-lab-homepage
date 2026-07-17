-- =============================================================================
-- 같은 날 + 같은 제목 + 같은 작성자 중복 삽입 차단 (news / posts)
-- =============================================================================
-- 배경: admin 글쓰기에서 저장이 느릴 때 이중 클릭 등으로 같은 글이 2번 insert 되어
--   중복 행이 생기는 사고가 있었다. 앱 레벨(저장 재진입 가드)에 더해 DB 레벨에서도
--   원천 차단한다.
--
-- '같은 날' 판정 = id 앞 10자리(YYYY-MM-DD).
--   id 는 BEFORE INSERT 트리거(assign_news_id / assign_post_id)가 삽입일 기준으로
--   부여하므로 left(id, 10) = 그 행이 insert 된 날짜다.
--   (created_at::date 는 세션 타임존에 의존해 IMMUTABLE 이 아니라서 인덱스 식에
--    쓸 수 없다 → 대신 id prefix 사용.)
--
-- author_email 이 NULL 이어도 하나로 묶이도록 coalesce 로 '' 치환.
-- (unique index 는 NULL 을 서로 다른 값으로 취급하므로 그대로 두면 NULL 작성자
--  중복이 안 걸린다.)
--
-- 두 번째 insert 는 23505(unique_violation) 로 거부된다. 정상적인 update(편집)는
-- 새 id 를 만들지 않으므로 이 인덱스의 영향을 받지 않는다.
-- 같은 날 같은 제목의 '서로 다른' 글을 일부러 2개 쓰려면 제목을 다르게 하면 된다.

create unique index if not exists news_no_same_day_dup
  on public.news (coalesce(author_email, ''), title, left(id, 10));

create unique index if not exists posts_no_same_day_dup
  on public.posts (coalesce(author_email, ''), title, left(id, 10));

comment on index public.news_no_same_day_dup is
  '중복 방지: 같은 날(id 앞 10자리) · 같은 제목 · 같은 작성자로 2번째 insert 차단';
comment on index public.posts_no_same_day_dup is
  '중복 방지: 같은 날(id 앞 10자리) · 같은 제목 · 같은 작성자로 2번째 insert 차단';
