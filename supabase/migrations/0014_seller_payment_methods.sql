alter table public.profiles
add column if not exists payment_alias text,
add column if not exists payment_cvu text,
add column if not exists payment_holder_name text,
add column if not exists payment_notes text,
add column if not exists payment_updated_at timestamptz;

comment on column public.profiles.payment_alias is 'Seller preferred payment alias, for example Mercado Pago alias.';
comment on column public.profiles.payment_cvu is 'Seller CVU or CBU for direct transfers.';
comment on column public.profiles.payment_holder_name is 'Seller payment account holder name.';
comment on column public.profiles.payment_notes is 'Seller payment instructions shared during direct sale coordination.';
