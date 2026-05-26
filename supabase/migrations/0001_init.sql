-- 日記すごろく 初期スキーマ (SPEC 9章)

create extension if not exists "pgcrypto";

-- 家族グループ
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code char(6) unique not null,
  created_at timestamptz default now()
);

-- ユーザー (id は Supabase Auth の uid と一致)
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  family_id uuid references families (id) on delete cascade,
  name_ja text not null,
  role text check (role in ('parent', 'child')),
  avatar_emoji text default '🐣',
  nobi_points integer default 0,
  created_at timestamptz default now()
);

-- ハプニングイベント (マスターデータ)
create table if not exists happening_events (
  id uuid primary key default gen_random_uuid(),
  theme_id text not null,
  title_ja text not null,
  effect_type text not null,
  effect_value integer,
  emoji text
);

-- ちいさなおねがいリスト (family_id が null ならデフォルト)
create table if not exists wish_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families (id) on delete cascade,
  text_ja text not null,
  is_active boolean default true
);

-- 日記エントリ
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families (id) on delete cascade,
  user_id uuid references users (id) on delete cascade,
  entry_date date not null,
  mood text,
  location text,
  partner text,
  activity text,
  note_text text,
  photo_url text,
  effect_type text,
  effect_value integer,
  np_awarded integer default 1,
  created_at timestamptz default now()
);

-- シーズン
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families (id) on delete cascade,
  theme_id text not null,
  start_date date not null,
  end_date date not null,
  board_json jsonb,
  status text default 'preparing'
);

-- プレイヤー状態
create table if not exists players (
  season_id uuid references seasons (id) on delete cascade,
  user_id uuid references users (id) on delete cascade,
  position integer default 0,
  finished_at timestamptz,
  primary key (season_id, user_id)
);

-- サイコロ履歴
create table if not exists dice_rolls (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons (id) on delete cascade,
  user_id uuid references users (id) on delete cascade,
  value integer not null,
  from_pos integer,
  to_pos integer,
  effect_applied jsonb,
  rolled_at timestamptz default now()
);

create index if not exists idx_users_family on users (family_id);
create index if not exists idx_diary_family_date on diary_entries (family_id, entry_date);
create index if not exists idx_seasons_family on seasons (family_id);
create index if not exists idx_happening_theme on happening_events (theme_id);
