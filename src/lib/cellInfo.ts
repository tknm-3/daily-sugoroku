import type { BoardCell, EffectType } from "./types";
import { describeEffect } from "./effects";
import type { SfxName } from "./sound";

/** マスの大きな分類。色や雰囲気を決めるのに使う。 */
export type CellMood = "start" | "goal" | "good" | "bad" | "special" | "neutral";

export interface CellInfo {
  /** マスに大きく表示するアイコン。 */
  icon: string;
  /** マスの種類名（例: すすむマス）。 */
  label: string;
  /** 何が起きるかの説明（子ども向け）。 */
  detail: string;
  /** 良い/悪い/特別の分類。 */
  mood: CellMood;
  /** マスの背景・枠のTailwindクラス。 */
  cellClass: string;
  /** バッジ（凡例）用の色クラス。 */
  badgeClass: string;
  /** 止まったときに鳴らす効果音。 */
  sfx: SfxName;
}

function moodOfEffect(type: EffectType | undefined): CellMood {
  switch (type) {
    case "MOVE_FORWARD":
    case "MOVE_ALL":
    case "EXTRA_DICE":
      return "good";
    case "MOVE_BACK":
    case "SKIP":
    case "WARP_START":
      return "bad";
    case "SWAP":
    case "FREE_MOVE":
    case "WISH":
      return "special";
    default:
      return "neutral";
  }
}

function sfxOfEffect(type: EffectType | undefined): SfxName {
  switch (type) {
    case "MOVE_FORWARD":
    case "MOVE_ALL":
      return "forward";
    case "MOVE_BACK":
      return "back";
    case "SKIP":
      return "skip";
    case "EXTRA_DICE":
      return "extra";
    case "SWAP":
      return "swap";
    case "WARP_START":
      return "warp";
    case "FREE_MOVE":
      return "wish";
    case "WISH":
      return "wish";
    default:
      return "move";
  }
}

const MOOD_CELL: Record<CellMood, string> = {
  start: "bg-sky-100 ring-2 ring-sky-300",
  goal: "bg-amber-100 ring-2 ring-amber-400",
  good: "bg-emerald-50 ring-1 ring-emerald-300",
  bad: "bg-rose-50 ring-1 ring-rose-300",
  special: "bg-violet-50 ring-1 ring-violet-300",
  neutral: "bg-white ring-1 ring-stone-200",
};

const MOOD_BADGE: Record<CellMood, string> = {
  start: "bg-sky-400 text-white",
  goal: "bg-amber-400 text-white",
  good: "bg-emerald-400 text-white",
  bad: "bg-rose-400 text-white",
  special: "bg-violet-400 text-white",
  neutral: "bg-stone-300 text-stone-700",
};

/** マスの種類と効果から、表示・色・音をまとめて求める。 */
export function cellInfo(cell: BoardCell): CellInfo {
  let icon: string;
  let label: string;
  let detail: string;
  let mood: CellMood;
  let sfx: SfxName;

  switch (cell.type) {
    case "start":
      icon = "🏁";
      label = "スタート";
      detail = "ここから ぼうけんが はじまるよ！";
      mood = "start";
      sfx = "move";
      break;
    case "goal":
      icon = "🎉";
      label = "ゴール";
      detail = "めざせ ゴール！ 1ばんのり だれかな？";
      mood = "goal";
      sfx = "goal";
      break;
    case "diary":
      icon = "📔";
      label = "日記マス";
      detail =
        cell.effect_type && cell.effect_type !== "NONE"
          ? `みんなの 日記の マス！ ${describeEffect(cell.effect_type, cell.effect_value ?? null)}`
          : "みんなの 日記の マス！";
      mood = cell.effect_type ? moodOfEffect(cell.effect_type) : "neutral";
      sfx = cell.effect_type ? sfxOfEffect(cell.effect_type) : "diary";
      break;
    case "wish":
      icon = "🎁";
      label = "おねがいマス";
      detail = "ちいさな おねがいが でるよ！";
      mood = "special";
      sfx = "wish";
      break;
    case "happening":
      icon = cell.emoji ?? "❓";
      label = "ハプニング";
      detail = cell.title
        ? `${cell.title} → ${describeEffect(cell.effect_type ?? "NONE", cell.effect_value ?? null)}`
        : describeEffect(cell.effect_type ?? "NONE", cell.effect_value ?? null);
      mood = moodOfEffect(cell.effect_type);
      sfx = sfxOfEffect(cell.effect_type);
      break;
    default:
      icon = "❓";
      label = "マス";
      detail = "";
      mood = "neutral";
      sfx = "move";
  }

  return {
    icon,
    label,
    detail,
    mood,
    cellClass: MOOD_CELL[mood],
    badgeClass: MOOD_BADGE[mood],
    sfx,
  };
}

/** 盤面の凡例（マスの色の意味）。 */
export const CELL_LEGEND: { mood: CellMood; label: string }[] = [
  { mood: "good", label: "すすむ・うれしい" },
  { mood: "bad", label: "もどる・おやすみ" },
  { mood: "special", label: "おねがい・とくべつ" },
  { mood: "neutral", label: "日記・なにもなし" },
];
