alter table public.raffles
add column if not exists winner_id uuid references public.profiles(id) on delete set null,
add column if not exists drawn_at timestamptz;

create or replace function public.protect_raffle_result_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if new.winner_id is distinct from old.winner_id
    or new.drawn_at is distinct from old.drawn_at then
    raise exception 'Raffle results can only be set by the secure draw function';
  end if;

  return new;
end;
$$;

drop trigger if exists raffles_protect_result_fields on public.raffles;
create trigger raffles_protect_result_fields
before update on public.raffles
for each row execute function public.protect_raffle_result_fields();

drop policy if exists "Users see raffle entries" on public.raffle_entries;
create policy "Users see related raffle entries" on public.raffle_entries
for select using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.raffles
    where raffles.id = raffle_entries.raffle_id
      and raffles.creator_id = auth.uid()
  )
);

create or replace function public.draw_raffle_winner(target_raffle_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  raffle_record public.raffles%rowtype;
  selected_user_id uuid;
begin
  select *
  into raffle_record
  from public.raffles
  where id = target_raffle_id
  for update;

  if raffle_record.id is null then
    raise exception 'Raffle not found';
  end if;

  if raffle_record.creator_id <> auth.uid() and not public.is_admin() then
    raise exception 'Only the organizer can draw this raffle';
  end if;

  if raffle_record.moderation_status <> 'approved' then
    raise exception 'Only approved raffles can be drawn';
  end if;

  if raffle_record.closes_at > now() then
    raise exception 'The raffle is still open';
  end if;

  if raffle_record.winner_id is not null then
    raise exception 'A winner has already been selected';
  end if;

  select user_id
  into selected_user_id
  from public.raffle_entries
  where raffle_id = target_raffle_id
  order by random()
  limit 1;

  if selected_user_id is null then
    raise exception 'The raffle has no participants';
  end if;

  update public.raffles
  set winner_id = selected_user_id, drawn_at = now()
  where id = target_raffle_id;

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    selected_user_id,
    'raffle_won',
    'Ganaste un sorteo',
    format('Fuiste seleccionado como ganador de "%s".', raffle_record.title),
    jsonb_build_object('raffle_id', target_raffle_id)
  );

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    raffle_record.creator_id,
    'raffle_drawn',
    'Ganador seleccionado',
    format('El sorteo "%s" ya tiene ganador.', raffle_record.title),
    jsonb_build_object('raffle_id', target_raffle_id, 'winner_id', selected_user_id)
  );

  return selected_user_id;
end;
$$;

revoke all on function public.draw_raffle_winner(uuid) from public;
grant execute on function public.draw_raffle_winner(uuid) to authenticated;
