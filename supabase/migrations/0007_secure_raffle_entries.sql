create or replace function public.validate_raffle_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raffle_record public.raffles%rowtype;
  current_entries integer;
begin
  select *
  into raffle_record
  from public.raffles
  where id = new.raffle_id;

  if raffle_record.id is null
    or raffle_record.moderation_status <> 'approved'
    or raffle_record.type <> 'free'
    or raffle_record.closes_at <= now() then
    raise exception 'This raffle is not accepting entries';
  end if;

  if raffle_record.creator_id = new.user_id then
    raise exception 'Raffle creators cannot enter their own raffle';
  end if;

  if raffle_record.entry_limit is not null then
    select count(*)
    into current_entries
    from public.raffle_entries
    where raffle_id = new.raffle_id;

    if current_entries >= raffle_record.entry_limit then
      raise exception 'This raffle has reached its entry limit';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists raffle_entries_validate on public.raffle_entries;
create trigger raffle_entries_validate
before insert on public.raffle_entries
for each row execute function public.validate_raffle_entry();
