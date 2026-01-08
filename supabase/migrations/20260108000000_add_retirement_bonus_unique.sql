with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by year_month desc, id desc
    ) as rn
  from public.life_events
  where category = 'retirement_bonus'
)
delete from public.life_events
using ranked
where public.life_events.id = ranked.id
  and ranked.rn > 1;

create unique index if not exists idx_life_events_retirement_bonus_user_id
  on public.life_events using btree (user_id)
  where category = 'retirement_bonus';
