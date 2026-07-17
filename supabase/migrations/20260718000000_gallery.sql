-- =============================================================================
-- Gallery (Lab Life) — 연구실 문화·사람 사진 갤러리
-- =============================================================================
-- 공개 읽기(anon 포함) / 화이트리스트 업로드 / 에디터·작성자 수정·삭제.
-- News 와 동일한 권한 모델(is_whitelist_member / is_site_editor 재사용).

create table if not exists public.gallery (
  id            uuid primary key default gen_random_uuid(),
  image_url     text not null,
  caption       text,
  album         text,                 -- 예: '2026 MT', 'Lab Dinner' (null 이면 기본 그룹)
  taken_on      date,                 -- 촬영일(정렬·표시용)
  display_order int  not null default 0,
  created_by    text references public.admin_users(email) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists gallery_order_idx
  on public.gallery (album, display_order, taken_on desc);

alter table public.gallery enable row level security;

create policy "gallery: public read"
  on public.gallery for select to anon, authenticated
  using (true);

create policy "gallery: whitelist insert (creator=self)"
  on public.gallery for insert to authenticated
  with check (
    public.is_whitelist_member()
    and created_by = (auth.jwt()->>'email')
  );

create policy "gallery: editors or creator update"
  on public.gallery for update to authenticated
  using      (public.is_site_editor() or created_by = (auth.jwt()->>'email'))
  with check (public.is_site_editor() or created_by = (auth.jwt()->>'email'));

create policy "gallery: editors or creator delete"
  on public.gallery for delete to authenticated
  using (public.is_site_editor() or created_by = (auth.jwt()->>'email'));

-- ----- storage: gallery-images 버킷 -----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('gallery-images', 'gallery-images', true, 10485760,
   array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "storage: public read gallery"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'gallery-images');

create policy "storage: whitelist write gallery"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery-images' and public.is_whitelist_member());

create policy "storage: whitelist update gallery"
  on storage.objects for update to authenticated
  using (bucket_id = 'gallery-images' and public.is_whitelist_member());

create policy "storage: whitelist delete gallery"
  on storage.objects for delete to authenticated
  using (bucket_id = 'gallery-images' and public.is_whitelist_member());
