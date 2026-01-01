alter table public.life_events
  add constraint life_events_category_check
  check (category in (
    'education', 'travel', 'care', 'medical', 'car',
    'housing_purchase', 'other', 'retirement_bonus'
  ));
