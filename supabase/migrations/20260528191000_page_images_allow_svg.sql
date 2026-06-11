-- 기관 로고 등 SVG 업로드 허용. page-images 버킷 허용 MIME 에 svg 추가.
-- (운영에는 직접 적용했었으나 마이그레이션으로 누락 → 재현 가능하도록 파일화)
update storage.buckets
  set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/svg+xml']
  where id = 'page-images';
