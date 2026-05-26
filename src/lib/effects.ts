import type { EffectType, Mood } from "./types";

export interface MoodDef {
  id: Mood;
  emoji: string;
  label: string;
  effect_type: EffectType;
  effect_value: number | null;
}

/** SPEC 4章: 気持ち → マス効果の自動マッピング */
export const MOODS: MoodDef[] = [
  { id: "happy", emoji: "😄", label: "うれしい", effect_type: "MOVE_FORWARD", effect_value: 2 },
  { id: "love", emoji: "🥰", label: "だいすき", effect_type: "MOVE_FORWARD", effect_value: 3 },
  { id: "surprised", emoji: "😲", label: "びっくり", effect_type: "EXTRA_DICE", effect_value: null },
  { id: "sleepy", emoji: "😴", label: "ねむい", effect_type: "SKIP", effect_value: null },
  { id: "sad", emoji: "🥲", label: "かなしい", effect_type: "MOVE_BACK", effect_value: -1 },
  { id: "angry", emoji: "😡", label: "おこった", effect_type: "MOVE_BACK", effect_value: -2 },
];

const MOOD_MAP = new Map<Mood, MoodDef>(MOODS.map((m) => [m.id, m]));

export interface MappedEffect {
  effect_type: EffectType;
  effect_value: number | null;
}

/** 気持ちからマス効果を求める。未設定（null）なら NONE。 */
export function effectForMood(mood: Mood | null | undefined): MappedEffect {
  if (!mood) {
    return { effect_type: "NONE", effect_value: null };
  }
  const def = MOOD_MAP.get(mood);
  if (!def) {
    return { effect_type: "NONE", effect_value: null };
  }
  return { effect_type: def.effect_type, effect_value: def.effect_value };
}

export function getMood(id: Mood): MoodDef | undefined {
  return MOOD_MAP.get(id);
}

/** 効果タイプを子ども向けの一言で説明する。 */
export function describeEffect(type: EffectType, value: number | null): string {
  switch (type) {
    case "MOVE_FORWARD":
      return `${value ?? 0}マス すすむ！`;
    case "MOVE_BACK":
      return `${Math.abs(value ?? 0)}マス もどる`;
    case "SKIP":
      return "1かい おやすみ";
    case "EXTRA_DICE":
      return "もう1かい サイコロ！";
    case "MOVE_ALL":
      return `みんな ${value ?? 0}マス すすむ！`;
    case "SWAP":
      return "だれかと コマこうかん";
    case "WARP_START":
      return "スタートに もどる";
    case "FREE_MOVE":
      return "すきな ばしょへ いどう！";
    case "WISH":
      return "ちいさな おねがい！";
    case "NONE":
    default:
      return "なにも おきない";
  }
}
