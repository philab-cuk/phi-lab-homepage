-- =============================================================================
-- ID 트리거 동시성 안전화 (transaction advisory lock) — news / posts
-- =============================================================================
-- 기존 assign_news_id / assign_post_id 는 "select max(seq)+1 → id 부여" 구조라,
-- 같은 날 '동시' insert 2건이 같은 max 를 읽어 같은 seq(=같은 id)를 만들면
-- PK 충돌로 한 건이 (서로 다른 글이어도) 엉뚱하게 실패할 수 있었다.
--
-- 트랜잭션 단위 advisory lock 으로 (테이블, 날짜)별 순번 계산을 직렬화한다.
--   - pg_advisory_xact_lock 은 트랜잭션 종료(commit/rollback) 시 자동 해제.
--   - 두 번째 트랜잭션은 첫 번째가 commit 될 때까지 대기 → 그 행이 보이므로
--     max+1 이 올바르게 '다음' 순번을 계산한다(-001, -002 …).
--   - 키를 (테이블, 날짜)로 나눠, 다른 테이블/다른 날 insert 끼리는 서로 안 막는다.
-- search_path 하드닝(20260521080000_advisor_followups)을 유지하려고 함수 정의에 명시.
--
-- 주의: 이 lock 은 '서로 다른 트랜잭션' 간 경합만 직렬화한다. 한 INSERT 문으로
--   같은 날 여러 행을 한 번에 넣는 경우(문장 내 자기 변경분 비가시성)는 별개이며,
--   앱은 한 번에 한 행만 insert 하므로 해당 없음.
-- 트리거(trg_assign_news_id / trg_assign_post_id)는 함수를 이름으로 참조하므로
--   함수 본문만 교체하면 그대로 적용된다(트리거 재생성 불필요).

create or replace function public.assign_news_id()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_date_prefix text := to_char(current_date, 'YYYY-MM-DD');
  v_seq int;
begin
  if new.id is not null and new.id <> '' then
    return new;
  end if;

  -- (테이블, 날짜)별 순번 계산 직렬화 — 트랜잭션 종료 시 자동 해제
  perform pg_advisory_xact_lock(hashtext('news_id'), hashtext(v_date_prefix));

  select coalesce(max(substring(id from '(\d+)$')::int), 0) + 1
  into v_seq
  from public.news
  where id like v_date_prefix || '-%';

  new.id := v_date_prefix || '-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;

create or replace function public.assign_post_id()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_date_prefix text := to_char(current_date, 'YYYY-MM-DD');
  v_seq int;
begin
  if new.id is not null and new.id <> '' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('post_id'), hashtext(v_date_prefix));

  select coalesce(max(substring(id from '(\d+)$')::int), 0) + 1
  into v_seq
  from public.posts
  where id like v_date_prefix || '-%';

  new.id := v_date_prefix || '-' || lpad(v_seq::text, 3, '0');
  return new;
end;
$$;
