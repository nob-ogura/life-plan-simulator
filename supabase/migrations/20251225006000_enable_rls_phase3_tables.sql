alter table public.children enable row level security;
alter table public.income_streams enable row level security;
alter table public.expenses enable row level security;
alter table public.rentals enable row level security;
alter table public.assets enable row level security;
alter table public.mortgages enable row level security;
alter table public.life_events enable row level security;

create policy "children_select_own" on public.children
for select
using (auth.uid() = user_id);

create policy "children_insert_own" on public.children
for insert
with check (auth.uid() = user_id);

create policy "children_update_own" on public.children
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "children_delete_own" on public.children
for delete
using (auth.uid() = user_id);

create policy "income_streams_select_own" on public.income_streams
for select
using (auth.uid() = user_id);

create policy "income_streams_insert_own" on public.income_streams
for insert
with check (auth.uid() = user_id);

create policy "income_streams_update_own" on public.income_streams
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "income_streams_delete_own" on public.income_streams
for delete
using (auth.uid() = user_id);

create policy "expenses_select_own" on public.expenses
for select
using (auth.uid() = user_id);

create policy "expenses_insert_own" on public.expenses
for insert
with check (auth.uid() = user_id);

create policy "expenses_update_own" on public.expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "expenses_delete_own" on public.expenses
for delete
using (auth.uid() = user_id);

create policy "rentals_select_own" on public.rentals
for select
using (auth.uid() = user_id);

create policy "rentals_insert_own" on public.rentals
for insert
with check (auth.uid() = user_id);

create policy "rentals_update_own" on public.rentals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "rentals_delete_own" on public.rentals
for delete
using (auth.uid() = user_id);

create policy "assets_select_own" on public.assets
for select
using (auth.uid() = user_id);

create policy "assets_insert_own" on public.assets
for insert
with check (auth.uid() = user_id);

create policy "assets_update_own" on public.assets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "assets_delete_own" on public.assets
for delete
using (auth.uid() = user_id);

create policy "mortgages_select_own" on public.mortgages
for select
using (auth.uid() = user_id);

create policy "mortgages_insert_own" on public.mortgages
for insert
with check (auth.uid() = user_id);

create policy "mortgages_update_own" on public.mortgages
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "mortgages_delete_own" on public.mortgages
for delete
using (auth.uid() = user_id);

create policy "life_events_select_own" on public.life_events
for select
using (auth.uid() = user_id);

create policy "life_events_insert_own" on public.life_events
for insert
with check (auth.uid() = user_id);

create policy "life_events_update_own" on public.life_events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "life_events_delete_own" on public.life_events
for delete
using (auth.uid() = user_id);
