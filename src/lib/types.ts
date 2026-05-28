export type Role = "parent" | "child";

export type ThemeId = "forest" | "space" | "ocean" | "home" | "hero" | "dream";

export type Mood = "happy" | "love" | "surprised" | "sleepy" | "sad" | "angry";

export type LocationId = "home" | "school" | "park" | "outing" | "other";

export type PartnerId =
  | "mama"
  | "papa"
  | "sibling"
  | "friend"
  | "teacher"
  | "alone"
  | "other";

export type ActivityId = "play" | "eat" | "study" | "help" | "other";

export type EffectType =
  | "MOVE_FORWARD"
  | "MOVE_BACK"
  | "SKIP"
  | "EXTRA_DICE"
  | "MOVE_ALL"
  | "SWAP"
  | "WARP_START"
  | "FREE_MOVE"
  | "WISH"
  | "NONE";

export type SeasonStatus = "preparing" | "playing" | "finished";

export type CellType = "start" | "goal" | "diary" | "happening" | "wish";

export interface BoardCell {
  index: number;
  type: CellType;
  entry_id?: string;
  event_id?: string;
  title?: string;
  emoji?: string;
  effect_type?: EffectType;
  effect_value?: number | null;
  // 日記マス用: 盤面生成時に埋め込む
  mood?: Mood;
  note_text?: string | null;
  entry_date?: string;
  location?: LocationId | null;
  partner?: PartnerId | null;
  activity?: ActivityId | null;
  user_name?: string;
  user_avatar?: string;
}

export type Board = BoardCell[];

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface User {
  id: string;
  family_id: string;
  name_ja: string;
  role: Role;
  avatar_emoji: string;
  nobi_points: number;
  created_at: string;
}

export interface HappeningEvent {
  id: string;
  theme_id: ThemeId;
  title_ja: string;
  effect_type: EffectType;
  effect_value: number | null;
  emoji: string | null;
}

export interface WishItem {
  id: string;
  family_id: string | null;
  text_ja: string;
  is_active: boolean;
}

export interface DiaryEntry {
  id: string;
  family_id: string;
  user_id: string;
  entry_date: string;
  mood: Mood | null;
  location: LocationId | null;
  partner: PartnerId | null;
  activity: ActivityId | null;
  note_text: string | null;
  photo_url: string | null;
  effect_type: EffectType | null;
  effect_value: number | null;
  np_awarded: number;
  created_at: string;
}

export interface Season {
  id: string;
  family_id: string;
  theme_id: ThemeId;
  start_date: string;
  end_date: string;
  board_json: Board | null;
  status: SeasonStatus;
}

export interface Player {
  season_id: string;
  user_id: string;
  position: number;
  finished_at: string | null;
}

export interface DiceRoll {
  id: string;
  season_id: string;
  user_id: string;
  value: number;
  from_pos: number;
  to_pos: number;
  effect_applied: AppliedEffect | null;
  rolled_at: string;
}

export interface AppliedEffect {
  effect_type: EffectType;
  effect_value?: number | null;
  from_pos: number;
  to_pos: number;
  note?: string;
}
