/** SPEC 8章: コマが育つ（のびっこポイント → 成長段階） */

export interface GrowthStage {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minNp: number;
  maxNp: number | null;
}

export const GROWTH_STAGES: GrowthStage[] = [
  { id: "egg", name: "たまご", emoji: "🥚", description: "はじまりのすがた", minNp: 0, maxNp: 4 },
  { id: "chick", name: "ひよこ", emoji: "🐣", description: "すこし成長", minNp: 5, maxNp: 14 },
  { id: "child", name: "こども", emoji: "🐤", description: "ぼうしがついた", minNp: 15, maxNp: 29 },
  { id: "adult", name: "おとな", emoji: "🐥", description: "かっこいいかっこう", minNp: 30, maxNp: 49 },
  { id: "hero", name: "ヒーロー", emoji: "🦸", description: "さいきょうのすがた！", minNp: 50, maxNp: null },
];

export function stageForPoints(np: number): GrowthStage {
  for (const stage of GROWTH_STAGES) {
    if (np >= stage.minNp && (stage.maxNp === null || np <= stage.maxNp)) {
      return stage;
    }
  }
  return GROWTH_STAGES[GROWTH_STAGES.length - 1];
}

/** 次の段階までに必要なポイント。最終段階なら null。 */
export function pointsToNextStage(np: number): number | null {
  const current = stageForPoints(np);
  const idx = GROWTH_STAGES.findIndex((s) => s.id === current.id);
  const next = GROWTH_STAGES[idx + 1];
  if (!next) return null;
  return next.minNp - np;
}

/** SPEC 8章: 日記入力で得られる NP を計算する。 */
export function calcNpAwarded(opts: {
  hasPhoto?: boolean;
  hasNote?: boolean;
  streak3?: boolean;
}): number {
  let np = 1; // 基本
  if (opts.hasPhoto) np += 2;
  if (opts.hasNote) np += 2;
  if (opts.streak3) np += 3;
  return np;
}
