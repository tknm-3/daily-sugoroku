"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTheme } from "@/lib/themes";
import { cellInfo, CELL_LEGEND } from "@/lib/cellInfo";
import { sound } from "@/lib/sound";
import {
  clampPosition,
  isGoal,
  lastIndex,
  landingPosition,
  resolveEffect,
  rollDice,
} from "@/lib/game";
import type { Board, BoardCell, ThemeId } from "@/lib/types";

export interface PlayerView {
  user_id: string;
  name_ja: string;
  avatar_emoji: string;
  position: number;
  finished: boolean;
}

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

interface Props {
  seasonId: string;
  themeId: ThemeId;
  board: Board;
  players: PlayerView[];
  wishes: string[];
}

export default function BoardGame({ seasonId, themeId, board, players: initial, wishes }: Props) {
  const router = useRouter();
  const theme = getTheme(themeId);
  const last = lastIndex(board);

  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [players, setPlayers] = useState<PlayerView[]>(initial);
  const [turnIndex, setTurnIndex] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState<string>("サイコロを ふってね！");
  const [skipFlags, setSkipFlags] = useState<Set<string>>(new Set());
  const [extraRoll, setExtraRoll] = useState(false);

  // 演出用
  const [flashCell, setFlashCell] = useState<number | null>(null);
  const [poppedUser, setPoppedUser] = useState<string | null>(null);
  const [detailCell, setDetailCell] = useState<BoardCell | null>(null);

  // 発動中の効果モーダル
  const [wishText, setWishText] = useState<string | null>(null);
  const [swapForUser, setSwapForUser] = useState<string | null>(null);
  const [freeMoveForUser, setFreeMoveForUser] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const current = players[turnIndex];
  const allFinished = players.every((p) => p.finished);
  const winner = players.find((p) => p.finished);
  const modalOpen =
    wishText !== null || swapForUser !== null || freeMoveForUser !== null;

  useEffect(() => {
    setMuted(sound.isMuted());
    return () => sound.stopBgm();
  }, []);

  // ゴール時のファンファーレ
  useEffect(() => {
    if (started && allFinished) sound.sfx("fanfare");
  }, [started, allFinished]);

  function setPos(userId: string, pos: number, finished?: boolean) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.user_id === userId
          ? { ...p, position: pos, finished: finished ?? p.finished }
          : p,
      ),
    );
  }

  async function persistPosition(userId: string, pos: number, finished: boolean) {
    await supabase
      .from("players")
      .update({
        position: pos,
        finished_at: finished ? new Date().toISOString() : null,
      })
      .eq("season_id", seasonId)
      .eq("user_id", userId);
  }

  // 「ゲームをはじめる」: 全員をスタートに戻してから遊び始める。
  async function startGame() {
    sound.resume();
    sound.sfx("fanfare");
    sound.startBgm(themeId);
    setMuted(sound.isMuted());

    setPlayers((prev) => prev.map((p) => ({ ...p, position: 0, finished: false })));
    setTurnIndex(0);
    setSkipFlags(new Set());
    setDice(null);
    setExtraRoll(false);
    setMessage("サイコロを ふってね！");
    setStarted(true);

    await supabase
      .from("players")
      .update({ position: 0, finished_at: null })
      .eq("season_id", seasonId);
    await supabase
      .from("seasons")
      .update({ status: "playing" })
      .eq("id", seasonId);
  }

  function toggleMute() {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      sound.resume();
      sound.startBgm(themeId);
      sound.sfx("tap");
    } else {
      sound.stopBgm();
    }
  }

  function flash(pos: number, userId: string) {
    setFlashCell(pos);
    setPoppedUser(userId);
    setTimeout(() => {
      setFlashCell(null);
      setPoppedUser(null);
    }, 600);
  }

  function nextTurnIndex(fromIndex: number, flags: Set<string>): number {
    const n = players.length;
    for (let step = 1; step <= n; step++) {
      const idx = (fromIndex + step) % n;
      const p = players[idx];
      if (p.finished) continue;
      if (flags.has(p.user_id)) {
        flags.delete(p.user_id); // 1回休んだので解除
        continue;
      }
      return idx;
    }
    return fromIndex;
  }

  function advanceTurn(updatedFlags?: Set<string>) {
    const flags = updatedFlags ?? new Set(skipFlags);
    const idx = nextTurnIndex(turnIndex, flags);
    setSkipFlags(flags);
    setTurnIndex(idx);
    setExtraRoll(false);
  }

  async function finalizeGoalIfNeeded(userId: string, pos: number): Promise<boolean> {
    if (isGoal(pos, board)) {
      setPos(userId, pos, true);
      await persistPosition(userId, pos, true);
      return true;
    }
    await persistPosition(userId, pos, false);
    return false;
  }

  async function handleRoll() {
    if (rolling || modalOpen || allFinished || !current) return;
    setRolling(true);
    sound.sfx("dice");

    // 演出用に数回パラパラさせる
    for (let i = 0; i < 8; i++) {
      setDice(rollDice());
      await sleep(60);
    }
    const value = rollDice();
    setDice(value);
    setRolling(false);

    const from = current.position;
    const landing = landingPosition(from, value, board);
    const cell = board[landing];
    const res = resolveEffect(cell, landing, board);

    // まず止まったマスへ移動を反映
    setPos(current.user_id, res.newPosition);
    sound.sfx("move");
    flash(res.newPosition, current.user_id);

    // マスの効果音（場面ごとに変わる）
    const reachedGoal = isGoal(res.newPosition, board);
    setTimeout(() => sound.sfx(reachedGoal ? "goal" : cellInfo(cell).sfx), 280);

    // 全員移動
    if (res.moveAllBy !== null) {
      const delta = res.moveAllBy;
      setPlayers((prev) =>
        prev.map((p) =>
          p.finished ? p : { ...p, position: clampPosition(p.position + delta, board) },
        ),
      );
      for (const p of players) {
        if (p.finished) continue;
        const np = clampPosition((p.user_id === current.user_id ? res.newPosition : p.position) + delta, board);
        await persistPosition(p.user_id, np, isGoal(np, board));
      }
    }

    // サイコロ履歴を記録
    await supabase.from("dice_rolls").insert({
      season_id: seasonId,
      user_id: current.user_id,
      value,
      from_pos: from,
      to_pos: res.newPosition,
      effect_applied: {
        effect_type: res.effect_type,
        effect_value: res.effect_value,
        from_pos: landing,
        to_pos: res.newPosition,
      },
    });

    setMessage(cellMessage(cell, res.effect_type));

    // 休みフラグ
    const flags = new Set(skipFlags);
    if (res.skipNext) flags.add(current.user_id);

    // インタラクティブ効果はモーダルで処理
    if (res.triggersWish) {
      setWishText(wishes.length ? wishes[Math.floor(Math.random() * wishes.length)] : "ぎゅってして！");
      setSkipFlags(flags);
      return;
    }
    if (res.needsSwapTarget && players.filter((p) => p.user_id !== current.user_id && !p.finished).length > 0) {
      setSwapForUser(current.user_id);
      setSkipFlags(flags);
      return;
    }
    if (res.needsFreeMove) {
      setFreeMoveForUser(current.user_id);
      setSkipFlags(flags);
      return;
    }

    // ゴール判定
    const reached = await finalizeGoalIfNeeded(current.user_id, res.newPosition);
    if (reached) setMessage(`🎉 ${current.name_ja} が ゴール！`);

    // もう1回 or 次の人へ
    if (res.extraRolls > 0 && !reached) {
      setExtraRoll(true);
      setSkipFlags(flags);
      setMessage((m) => m + " もう1回 ふってね！");
    } else {
      advanceTurn(flags);
    }

    await maybeFinishSeason();
  }

  async function maybeFinishSeason() {
    // 状態更新は次レンダリングで反映されるため、最新値を計算
    const everyone = players.every((p) => p.finished || p.position >= last);
    if (everyone) {
      await supabase.from("seasons").update({ status: "finished" }).eq("id", seasonId);
    }
  }

  async function closeWish() {
    sound.sfx("wish");
    const userId = swapForUser ?? freeMoveForUser ?? current?.user_id;
    setWishText(null);
    if (userId) await afterInteractive(userId);
  }

  async function chooseSwap(targetId: string) {
    if (!swapForUser) return;
    sound.sfx("swap");
    const me = players.find((p) => p.user_id === swapForUser)!;
    const target = players.find((p) => p.user_id === targetId)!;
    const myPos = me.position;
    const targetPos = target.position;
    setPos(me.user_id, targetPos);
    setPos(target.user_id, myPos);
    flash(targetPos, me.user_id);
    await persistPosition(me.user_id, targetPos, isGoal(targetPos, board));
    await persistPosition(target.user_id, myPos, isGoal(myPos, board));
    const uid = swapForUser;
    setSwapForUser(null);
    await afterInteractive(uid);
  }

  async function chooseFreeMove(pos: number) {
    if (!freeMoveForUser) return;
    sound.sfx("forward");
    setPos(freeMoveForUser, pos);
    flash(pos, freeMoveForUser);
    const reached = await finalizeGoalIfNeeded(freeMoveForUser, pos);
    const uid = freeMoveForUser;
    setFreeMoveForUser(null);
    if (reached) setMessage("🎉 ゴール！");
    await afterInteractive(uid);
  }

  async function afterInteractive(userId: string) {
    const p = players.find((x) => x.user_id === userId);
    if (p && isGoal(p.position, board)) {
      await finalizeGoalIfNeeded(userId, p.position);
    }
    advanceTurn();
    await maybeFinishSeason();
  }

  return (
    <main className={`min-h-dvh bg-gradient-to-br ${theme.gradient} bg-animated p-4`}>
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-stone-700">
            {theme.emoji} {theme.name}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={muted ? "音を つける" : "音を けす"}
              className="rounded-2xl bg-white/70 px-3 py-1 text-lg"
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={() => {
                sound.sfx("tap");
                router.push("/home");
              }}
              className="rounded-2xl bg-white/70 px-3 py-1 text-sm font-bold"
            >
              ホーム
            </button>
          </div>
        </header>

        <BoardGrid
          board={board}
          players={players}
          flashCell={flashCell}
          poppedUser={poppedUser}
          currentUserId={current?.user_id}
          onCellTap={(c) => {
            sound.sfx("tap");
            setDetailCell(c);
          }}
        />

        <Legend />

        <div className="rounded-3xl bg-white/85 p-4 text-center shadow">
          {allFinished ? (
            <div className="flex flex-col items-center gap-2">
              <p className="pop-in text-3xl font-extrabold text-rose-600">🎉 ゴール！</p>
              <p>{theme.goalMessage}</p>
              {winner && (
                <p className="font-bold">
                  1ばんは {winner.avatar_emoji} {winner.name_ja}！
                </p>
              )}
              <button
                onClick={() => {
                  sound.sfx("tap");
                  router.push("/home");
                }}
                className="btn-pop bg-rose-500 text-white"
              >
                ホームへ もどる
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500">いまの ばん</p>
              <p className="animate-bob text-xl font-extrabold">
                {current?.avatar_emoji} {current?.name_ja}
              </p>
              <div className={`my-2 text-6xl ${rolling ? "dice-rolling" : ""}`}>
                {dice ? DICE_FACES[dice] : "🎲"}
              </div>
              <p className="min-h-6 text-sm font-bold text-stone-700">{message}</p>
              <button
                onClick={handleRoll}
                disabled={rolling || modalOpen}
                className="btn-pop mt-2 w-full bg-violet-500 text-white disabled:opacity-50"
              >
                {rolling ? "ころころ..." : extraRoll ? "もう1回 ふる！" : "サイコロを ふる"}
              </button>
            </>
          )}
        </div>
      </div>

      {!started && (
        <StartOverlay theme={theme} onStart={startGame} />
      )}

      {allFinished && started && <Confetti />}

      {detailCell && (
        <CellDetail cell={detailCell} onClose={() => setDetailCell(null)} />
      )}

      {wishText && (
        <Modal title="🎁 ちいさな おねがい">
          <p className="text-center text-xl font-bold">{wishText}</p>
          <button onClick={closeWish} className="btn-pop bg-emerald-500 text-white">
            できた！
          </button>
        </Modal>
      )}

      {swapForUser && (
        <Modal title="🔄 だれと コマこうかん する？">
          <div className="flex flex-col gap-2">
            {players
              .filter((p) => p.user_id !== swapForUser && !p.finished)
              .map((p) => (
                <button
                  key={p.user_id}
                  onClick={() => chooseSwap(p.user_id)}
                  className="btn-pop bg-stone-100"
                >
                  {p.avatar_emoji} {p.name_ja}
                </button>
              ))}
          </div>
        </Modal>
      )}

      {freeMoveForUser !== null && (
        <Modal title="✨ すきな ばしょへ いどう">
          <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
            {board.map((c) => (
              <button
                key={c.index}
                onClick={() => chooseFreeMove(c.index)}
                className="rounded-lg bg-stone-100 py-2 text-xs font-bold active:bg-rose-200"
              >
                {c.index}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}

function cellMessage(cell: BoardCell, effectType: BoardCell["effect_type"]): string {
  const info = cellInfo(cell);
  if (!effectType || effectType === "NONE") {
    return cell.type === "diary" || cell.type === "happening" || cell.type === "wish"
      ? info.detail
      : "そのまま！";
  }
  return info.detail;
}

function BoardGrid({
  board,
  players,
  flashCell,
  poppedUser,
  currentUserId,
  onCellTap,
}: {
  board: Board;
  players: PlayerView[];
  flashCell: number | null;
  poppedUser: string | null;
  currentUserId?: string;
  onCellTap: (cell: BoardCell) => void;
}) {
  const tokensByCell = new Map<number, PlayerView[]>();
  for (const p of players) {
    const arr = tokensByCell.get(p.position) ?? [];
    arr.push(p);
    tokensByCell.set(p.position, arr);
  }

  return (
    <div className="grid grid-cols-5 gap-1.5 rounded-3xl bg-white/50 p-2">
      {board.map((cell) => {
        const info = cellInfo(cell);
        const isFlash = flashCell === cell.index;
        return (
          <button
            key={cell.index}
            onClick={() => onCellTap(cell)}
            className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-center ${info.cellClass} ${isFlash ? "cell-flash" : ""}`}
          >
            <span className="absolute left-1 top-0.5 text-[9px] text-stone-400">
              {cell.index}
            </span>
            <span className="text-lg leading-none">{info.icon}</span>
            <div className="absolute -bottom-1 flex flex-wrap justify-center">
              {(tokensByCell.get(cell.index) ?? []).map((p) => (
                <span
                  key={p.user_id}
                  className={`text-base drop-shadow ${
                    poppedUser === p.user_id ? "token-pop" : ""
                  } ${currentUserId === p.user_id ? "animate-bob" : ""}`}
                >
                  {p.avatar_emoji}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const LEGEND_DOT: Record<string, string> = {
  good: "bg-emerald-400",
  bad: "bg-rose-400",
  special: "bg-violet-400",
  neutral: "bg-stone-300",
};

function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-white/70 px-3 py-2 text-[11px] font-bold text-stone-600">
      <span className="text-stone-400">マスをタップで くわしく！</span>
      {CELL_LEGEND.map((l) => (
        <span key={l.mood} className="flex items-center gap-1">
          <span className={`inline-block h-3 w-3 rounded-full ${LEGEND_DOT[l.mood]}`} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

function CellDetail({ cell, onClose }: { cell: BoardCell; onClose: () => void }) {
  const info = cellInfo(cell);
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="pop-in flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-5xl">{info.icon}</span>
        <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${info.badgeClass}`}>
          {info.label}
        </span>
        <p className="text-center text-base font-bold text-stone-700">{info.detail}</p>
        <button onClick={onClose} className="btn-pop bg-stone-200 text-base">
          とじる
        </button>
      </div>
    </div>
  );
}

function StartOverlay({
  theme,
  onStart,
}: {
  theme: ReturnType<typeof getTheme>;
  onStart: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-gradient-to-br ${theme.gradient} bg-animated p-8`}
    >
      <div className="pop-in flex flex-col items-center gap-3 text-center">
        <span className="text-7xl">{theme.emoji}</span>
        <h2 className="text-2xl font-extrabold text-stone-700">{theme.name}</h2>
        <p className="text-sm font-bold text-stone-600">
          みんな スタートから よーい どん！
        </p>
      </div>
      <button onClick={onStart} className="btn-pop animate-bob bg-rose-500 text-2xl text-white">
        🎲 ゲームを はじめる！
      </button>
    </div>
  );
}

const CONFETTI_COLORS = ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2.5 + Math.random() * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function Modal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-6">
      <div className="pop-in flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-center text-lg font-extrabold text-rose-700">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
