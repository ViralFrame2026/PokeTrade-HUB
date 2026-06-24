create policy "Admins delete listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and public.is_admin()
);
