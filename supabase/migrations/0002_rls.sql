-- Row Level Security: 家族グループ単位でアクセスを制限する

-- 自分の family_id を返すヘルパー
create or replace function current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from users where id = auth.uid();
$$;

alter table families enable row level security;
alter table users enable row level security;
alter table happening_events enable row level security;
alter table wish_items enable row level security;
alter table diary_entries enable row level security;
alter table seasons enable row level security;
alter table players enable row level security;
alter table dice_rolls enable row level security;

-- families: 自分の家族のみ参照。作成は誰でも可（サインアップ時）。
create policy families_select on families
  for select using (id = current_family_id());
create policy families_insert on families
  for insert with check (true);
create policy families_update on families
  for update using (id = current_family_id());

-- users: 同じ家族のメンバーを参照。自分のレコードのみ作成・更新。
create policy users_select on users
  for select using (family_id = current_family_id() or id = auth.uid());
create policy users_insert on users
  for insert with check (id = auth.uid());
create policy users_update on users
  for update using (id = auth.uid());

-- happening_events: マスターデータ。全員参照可。
create policy happening_select on happening_events
  for select using (true);

-- wish_items: デフォルト(null) と自分の家族のもの。
create policy wish_select on wish_items
  for select using (family_id is null or family_id = current_family_id());
create policy wish_write on wish_items
  for all using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- diary_entries: 自分の家族のもの。書き込みは自分のレコードのみ。
create policy diary_select on diary_entries
  for select using (family_id = current_family_id());
create policy diary_insert on diary_entries
  for insert with check (family_id = current_family_id() and user_id = auth.uid());
create policy diary_update on diary_entries
  for update using (user_id = auth.uid());
create policy diary_delete on diary_entries
  for delete using (user_id = auth.uid());

-- seasons: 自分の家族のもの。
create policy seasons_select on seasons
  for select using (family_id = current_family_id());
create policy seasons_write on seasons
  for all using (family_id = current_family_id())
  with check (family_id = current_family_id());

-- players: 自分の家族のシーズンに属するもの。
create policy players_select on players
  for select using (
    season_id in (select id from seasons where family_id = current_family_id())
  );
create policy players_write on players
  for all using (
    season_id in (select id from seasons where family_id = current_family_id())
  )
  with check (
    season_id in (select id from seasons where family_id = current_family_id())
  );

-- dice_rolls: 自分の家族のシーズンに属するもの。
create policy dice_select on dice_rolls
  for select using (
    season_id in (select id from seasons where family_id = current_family_id())
  );
create policy dice_insert on dice_rolls
  for insert with check (
    season_id in (select id from seasons where family_id = current_family_id())
  );
