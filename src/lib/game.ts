import type { Board, BoardCell, EffectType } from "./types";

export function lastIndex(board: Board): number {
  return board.length - 1;
}

export function clampPosition(pos: number, board: Board): number {
  if (pos < 0) return 0;
  const last = lastIndex(board);
  if (pos > last) return last;
  return pos;
}

export function isGoal(pos: number, board: Board): boolean {
  return pos >= lastIndex(board);
}

/** サイコロを振った後に止まるマス位置（ゴールで頭打ち）。 */
export function landingPosition(from: number, dice: number, board: Board): number {
  return clampPosition(from + dice, board);
}

export interface EffectResolution {
  /** このプレイヤーの新しい位置。 */
  newPosition: number;
  /** 効果の種類。 */
  effect_type: EffectType;
  effect_value: number | null;
  /** 全員に適用するマス移動量（MOVE_ALL）。 */
  moveAllBy: number | null;
  /** もう1回サイコロを振れる回数（EXTRA_DICE）。 */
  extraRolls: number;
  /** 次の自分の番を1回休む（SKIP）。 */
  skipNext: boolean;
  /** 相手プレイヤーとコマ交換が必要（SWAP）。 */
  needsSwapTarget: boolean;
  /** 好きな場所を選んで移動が必要（FREE_MOVE）。 */
  needsFreeMove: boolean;
  /** ちいさなおねがいが発動（WISH）。 */
  triggersWish: boolean;
}

/**
 * 止まったマスの効果を解決する。
 * MOVE_FORWARD / MOVE_BACK / WARP_START はこの場で位置を確定する。
 * SWAP / FREE_MOVE / WISH / EXTRA_DICE は UI 側での追加処理が必要なためフラグで返す。
 */
export function resolveEffect(cell: BoardCell, landingPos: number, board: Board): EffectResolution {
  const base: EffectResolution = {
    newPosition: landingPos,
    effect_type: cell.effect_type ?? "NONE",
    effect_value: cell.effect_value ?? null,
    moveAllBy: null,
    extraRolls: 0,
    skipNext: false,
    needsSwapTarget: false,
    needsFreeMove: false,
    triggersWish: false,
  };

  switch (cell.effect_type) {
    case "MOVE_FORWARD":
      base.newPosition = clampPosition(landingPos + (cell.effect_value ?? 0), board);
      break;
    case "MOVE_BACK":
      // effect_value は負の値で格納されている。
      base.newPosition = clampPosition(landingPos + (cell.effect_value ?? 0), board);
      break;
    case "WARP_START":
      base.newPosition = 0;
      break;
    case "MOVE_ALL":
      base.moveAllBy = cell.effect_value ?? 0;
      break;
    case "EXTRA_DICE":
      base.extraRolls = cell.effect_value && cell.effect_value > 0 ? cell.effect_value : 1;
      break;
    case "SKIP":
      base.skipNext = true;
      break;
    case "SWAP":
      base.needsSwapTarget = true;
      break;
    case "FREE_MOVE":
      base.needsFreeMove = true;
      break;
    case "WISH":
      base.triggersWish = true;
      break;
    case "NONE":
    default:
      break;
  }

  return base;
}

export function rollDice(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 6);
}
