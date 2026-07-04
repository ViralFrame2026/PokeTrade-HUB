create extension if not exists pgcrypto;

create type public.listing_type as enum ('sale', 'trade', 'raffle', 'free');
create type public.listing_status as enum (
  'pending',
  'active',
  'reserved',
  'sold',
  'traded',
  'finished',
  'rejected'
);
create type public.moderation_status as enum ('pending', 'approved', 'rejected', 'changes_requested');
create type public.product_category as enum ('card', 'sealed', 'accessory');
create type public.raffle_type as enum ('free', 'paid', 'numbered');
create type public.report_reason as enum (
  'fake_listing',
  'missing_product',
  'misleading_information',
  'scam',
  'suspicious_behavior'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  city text,
  country text,
  bio text,
  whatsapp text,
  instagram text,
  facebook text,
  is_admin boolean not null default false,
  is_verified boolean not null default false,
  reputation_average numeric(3, 2) not null default 0,
  reputation_count integer not null default 0,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  pokemon_tcg_id text not null unique,
  official_name text not null,
  image_small text not null,
  image_large text not null,
  set_id text not null,
  set_name text not null,
  rarity text,
  number text,
  official_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete restrict,
  category public.product_category not null,
  title text not null,
  condition text not null,
  language text not null default 'Espanol',
  description text,
  sealed_type text,
  accessory_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint card_products_need_card check (
    (category = 'card' and card_id is not null)
    or (category <> 'card')
  )
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  type public.listing_type not null,
  status public.listing_status not null default 'pending',
  moderation_status public.moderation_status not null default 'pending',
  title text not null,
  description text,
  price numeric(12, 2),
  trade_wants text,
  location_city text,
  location_country text,
  rejection_reason text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_requires_price check (type <> 'sale' or price is not null),
  constraint trade_requires_wants check (type <> 'trade' or trade_wants is not null)
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint one_favorite_target check (
    num_nonnulls(listing_id, card_id, profile_id) = 1
  )
);

create unique index favorites_unique_listing on public.favorites(user_id, listing_id)
where listing_id is not null;
create unique index favorites_unique_card on public.favorites(user_id, card_id)
where card_id is not null;
create unique index favorites_unique_profile on public.favorites(user_id, profile_id)
where profile_id is not null;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  raffle_id uuid,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  like_count integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comment_target check (num_nonnulls(listing_id, raffle_id) = 1)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  stars integer not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint no_self_rating check (reviewer_id <> reviewed_id)
);

create table public.raffles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  type public.raffle_type not null,
  title text not null,
  prize text not null,
  image_path text,
  requirements text,
  entry_limit integer,
  closes_at timestamptz not null,
  moderation_status public.moderation_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments
add constraint comments_raffle_fk foreign key (raffle_id) references public.raffles(id) on delete cascade;

create table public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  number integer,
  payment_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (raffle_id, user_id),
  unique (raffle_id, number)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason public.report_reason not null,
  details text,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint report_target check (num_nonnulls(listing_id, reported_user_id) >= 1)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint no_self_message check (sender_id <> recipient_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger cards_touch_updated_at
before update on public.cards
for each row execute function public.touch_updated_at();

create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

create trigger listings_touch_updated_at
before update on public.listings
for each row execute function public.touch_updated_at();

create trigger comments_touch_updated_at
before update on public.comments
for each row execute function public.touch_updated_at();

create trigger raffles_touch_updated_at
before update on public.raffles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Entrenador TCG'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if not public.is_admin() and (
    new.is_admin is distinct from old.is_admin
    or new.is_verified is distinct from old.is_verified
    or new.reputation_average is distinct from old.reputation_average
    or new.reputation_count is distinct from old.reputation_count
    or new.joined_at is distinct from old.joined_at
  ) then
    raise exception 'Only administrators can update protected profile fields';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_system_fields
before update on public.profiles
for each row execute function public.protect_profile_system_fields();

create or replace function public.protect_listing_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.moderation_status <> 'pending'
      or new.rejection_reason is not null
      or new.approved_at is not null then
      raise exception 'New listings must start pending moderation';
    end if;
    return new;
  end if;

  if new.rejection_reason is distinct from old.rejection_reason
    or new.approved_at is distinct from old.approved_at
    or (
      new.moderation_status is distinct from old.moderation_status
      and not (
        old.moderation_status = 'changes_requested'
        and new.moderation_status = 'pending'
      )
    ) then
    raise exception 'Only administrators can update listing moderation fields';
  end if;

  return new;
end;
$$;

create trigger listings_protect_moderation_fields
before insert or update on public.listings
for each row execute function public.protect_listing_moderation_fields();

create or replace function public.protect_raffle_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.moderation_status <> 'pending' or new.rejection_reason is not null then
      raise exception 'New raffles must start pending moderation';
    end if;
    return new;
  end if;

  if new.rejection_reason is distinct from old.rejection_reason
    or (
      new.moderation_status is distinct from old.moderation_status
      and not (
        old.moderation_status = 'changes_requested'
        and new.moderation_status = 'pending'
      )
    ) then
    raise exception 'Only administrators can update raffle moderation fields';
  end if;

  return new;
end;
$$;

create trigger raffles_protect_moderation_fields
before insert or update on public.raffles
for each row execute function public.protect_raffle_moderation_fields();

create or replace function public.refresh_reputation()
returns trigger
language plpgsql
as $$
begin
  update public.profiles
  set
    reputation_average = coalesce((
      select round(avg(stars)::numeric, 2)
      from public.ratings
      where reviewed_id = coalesce(new.reviewed_id, old.reviewed_id)
    ), 0),
    reputation_count = (
      select count(*)
      from public.ratings
      where reviewed_id = coalesce(new.reviewed_id, old.reviewed_id)
    )
  where id = coalesce(new.reviewed_id, old.reviewed_id);
  return coalesce(new, old);
end;
$$;

create trigger ratings_refresh_reputation
after insert or update or delete on public.ratings
for each row execute function public.refresh_reputation();

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.products enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;

create policy "Profiles are public" on public.profiles
for select using (true);

create policy "Users update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Admins manage profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create policy "Cards are readable" on public.cards
for select using (true);

create policy "Authenticated users can cache official cards" on public.cards
for insert with check (auth.role() = 'authenticated');

create policy "Products readable when listing visible" on public.products
for select using (
  exists (
    select 1 from public.listings
    where listings.product_id = products.id
    and (listings.moderation_status = 'approved' or listings.seller_id = auth.uid() or public.is_admin())
  )
);

create policy "Users manage own products" on public.products
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Admins manage products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

create policy "Approved listings are public" on public.listings
for select using (moderation_status = 'approved' or seller_id = auth.uid() or public.is_admin());

create policy "Users create own listings" on public.listings
for insert with check (seller_id = auth.uid() and moderation_status = 'pending');

create policy "Users update own draft listings" on public.listings
for update using (seller_id = auth.uid() and moderation_status in ('pending', 'changes_requested'))
with check (seller_id = auth.uid());

create policy "Admins manage listings" on public.listings
for all using (public.is_admin()) with check (public.is_admin());

create policy "Visible listing images are public" on public.listing_images
for select using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
    and (listings.moderation_status = 'approved' or listings.seller_id = auth.uid() or public.is_admin())
  )
);

create policy "Owners manage listing images" on public.listing_images
for all using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
  )
);

create policy "Users manage own favorites" on public.favorites
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Visible comments are public" on public.comments
for select using (is_hidden = false or author_id = auth.uid() or public.is_admin());

create policy "Users create comments" on public.comments
for insert with check (author_id = auth.uid());

create policy "Users update own comments" on public.comments
for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "Admins manage comments" on public.comments
for all using (public.is_admin()) with check (public.is_admin());

create policy "Ratings are public" on public.ratings
for select using (true);

create policy "Users create ratings" on public.ratings
for insert with check (reviewer_id = auth.uid());

create policy "Public approved raffles" on public.raffles
for select using (moderation_status = 'approved' or creator_id = auth.uid() or public.is_admin());

create policy "Users manage own raffles" on public.raffles
for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create policy "Admins manage raffles" on public.raffles
for all using (public.is_admin()) with check (public.is_admin());

create policy "Users see raffle entries" on public.raffle_entries
for select using (user_id = auth.uid() or public.is_admin());

create policy "Users enter raffles" on public.raffle_entries
for insert with check (user_id = auth.uid());

create policy "Users see own notifications" on public.notifications
for select using (user_id = auth.uid());

create policy "Users update own notifications" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Admins create notifications" on public.notifications
for insert with check (public.is_admin());

create policy "Users create reports" on public.reports
for insert with check (reporter_id = auth.uid());

create policy "Admins manage reports" on public.reports
for all using (public.is_admin()) with check (public.is_admin());

create policy "Users see own messages" on public.messages
for select using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users send messages" on public.messages
for insert with check (sender_id = auth.uid());

create policy "Users update received messages" on public.messages
for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy "Admins read audit logs" on public.audit_logs
for select using (public.is_admin());

create policy "Admins create audit logs" on public.audit_logs
for insert with check (public.is_admin());

create index profiles_reputation_idx on public.profiles(reputation_average desc, reputation_count desc);
create index cards_official_name_idx on public.cards using gin(to_tsvector('simple', official_name));
create index listings_status_idx on public.listings(moderation_status, status, created_at desc);
create index listings_seller_idx on public.listings(seller_id, created_at desc);
create index products_owner_idx on public.products(owner_id);
create index comments_listing_idx on public.comments(listing_id, created_at desc);
create index raffles_status_idx on public.raffles(moderation_status, closes_at);
create index notifications_user_idx on public.notifications(user_id, read_at, created_at desc);
create index reports_resolved_idx on public.reports(resolved_at, created_at desc);
