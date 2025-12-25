alter table public.profiles enable row level security;
alter table public.simulation_settings enable row level security;

create policy "profiles_select_own" on public.profiles
for select
using (auth.uid() = user_id);

create policy "profiles_insert_own" on public.profiles
for insert
with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "profiles_delete_own" on public.profiles
for delete
using (auth.uid() = user_id);

create policy "simulation_settings_select_own" on public.simulation_settings
for select
using (auth.uid() = user_id);

create policy "simulation_settings_insert_own" on public.simulation_settings
for insert
with check (auth.uid() = user_id);

create policy "simulation_settings_update_own" on public.simulation_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "simulation_settings_delete_own" on public.simulation_settings
for delete
using (auth.uid() = user_id);
