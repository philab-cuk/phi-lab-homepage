-- Posts 게시판화: 조회수(views) + 공지 고정(pinned) + 익명 조회수 증가 RPC.
alter table public.posts add column if not exists views int not null default 0;
alter table public.posts add column if not exists pinned boolean not null default false;
-- 작성자 표시이름 비정규화: admin_users 는 anon 이 못 읽으므로(RLS) 저장 시 복사.
alter table public.posts add column if not exists author_name text;
comment on column public.posts.views is '상세 조회수';
comment on column public.posts.pinned is '공지 고정(목록 상단 Notice)';
comment on column public.posts.author_name is '작성자 표시이름(저장 시 admin_users.display_name 복사)';

create index if not exists posts_pinned_published_idx on public.posts (pinned desc, published_at desc) where status = 'published';

-- 익명 방문자도 조회수를 올릴 수 있도록 SECURITY DEFINER 로 published 행만 +1.
create or replace function public.increment_post_views(p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set views = views + 1 where id = p_id and status = 'published';
$$;

revoke all on function public.increment_post_views(text) from public;
grant execute on function public.increment_post_views(text) to anon, authenticated;
