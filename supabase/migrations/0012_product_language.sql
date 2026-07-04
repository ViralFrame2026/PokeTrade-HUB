alter table public.products
add column if not exists language text not null default 'Espanol';

update public.products
set language = 'Espanol'
where language is null or trim(language) = '';
