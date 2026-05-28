-- 강의 사진(여러 장) 저장용 storage 버킷. 공개 읽기 + editor 쓰기.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('lecture-images', 'lecture-images', true, 10485760,
   array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "storage: public read lecture-images" on storage.objects;
create policy "storage: public read lecture-images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'lecture-images');

drop policy if exists "storage: editors write lecture-images" on storage.objects;
create policy "storage: editors write lecture-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'lecture-images' and public.is_site_editor());

drop policy if exists "storage: editors update lecture-images" on storage.objects;
create policy "storage: editors update lecture-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'lecture-images' and public.is_site_editor());

drop policy if exists "storage: editors delete lecture-images" on storage.objects;
create policy "storage: editors delete lecture-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'lecture-images' and public.is_site_editor());
