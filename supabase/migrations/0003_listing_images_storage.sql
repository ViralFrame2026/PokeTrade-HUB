insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public listing photos are readable"
on storage.objects for select
using (bucket_id = 'listing-images');

create policy "Users upload listing photos to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own listing photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
);

create policy "Users delete own listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
);
