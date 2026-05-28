import type { Board, BoardCell, DiaryEntry, HappeningEvent } from "./types";

export type Rng = () => number;

/** mulberry32: 文字列シードから決定的な乱数生成器を作る（テスト・再現用）。 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number, rng: Rng): T[] {
  return shuffle(arr, rng).slice(0, Math.min(n, arr.length));
}

function randInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export interface GenerateBoardParams {
  /** 今週の日記（全件）。 */
  diaryEntries: Pick<DiaryEntry, "id" | "user_id" | "effect_type" | "effect_value" | "mood" | "note_text" | "entry_date" | "location" | "partner" | "activity">[];
  /** テーマに対応するハプニングイベント（DB から取得済み）。 */
  happenings: HappeningEvent[];
  /** ユーザー情報マップ（user_id → 名前・アバター）。 */
  users?: Map<string, { name_ja: string; avatar_emoji: string }>;
  /** ハプニングマス枚数（既定 10〜12）。 */
  happeningCount?: number;
  /** ちいさなおねがいマス枚数（既定 2〜3）。 */
  wishCount?: number;
  rng?: Rng;
}

/** SPEC 6章: 盤面生成ロジック。start を先頭、goal を末尾に固定し、その間をシャッフルする。 */
export function generateBoard(params: GenerateBoardParams): Board {
  const rng = params.rng ?? Math.random;
  const happeningCount = params.happeningCount ?? randInt(10, 12, rng);
  const wishCount = params.wishCount ?? randInt(2, 3, rng);

  const diaryCells: BoardCell[] = params.diaryEntries.map((e) => {
    const user = e.user_id ? params.users?.get(e.user_id) : undefined;
    return {
      index: 0,
      type: "diary",
      entry_id: e.id,
      effect_type: e.effect_type ?? "NONE",
      effect_value: e.effect_value ?? null,
      mood: e.mood ?? undefined,
      note_text: e.note_text,
      entry_date: e.entry_date,
      location: e.location,
      partner: e.partner,
      activity: e.activity,
      user_name: user?.name_ja,
      user_avatar: user?.avatar_emoji,
    };
  });

  const happeningCells: BoardCell[] = pickN(
    params.happenings,
    happeningCount,
    rng,
  ).map((h) => ({
    index: 0,
    type: "happening",
    event_id: h.id,
    title: h.title_ja,
    emoji: h.emoji ?? undefined,
    effect_type: h.effect_type,
    effect_value: h.effect_value,
  }));

  const wishCells: BoardCell[] = Array.from({ length: wishCount }, () => ({
    index: 0,
    type: "wish" as const,
    effect_type: "WISH" as const,
  }));

  const middle = shuffle(
    [...diaryCells, ...happeningCells, ...wishCells],
    rng,
  );

  const board: Board = [
    { index: 0, type: "start" },
    ...middle,
    { index: 0, type: "goal" },
  ];

  return board.map((cell, i) => ({ ...cell, index: i }));
}
