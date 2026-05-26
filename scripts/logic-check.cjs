// DB 不要: ドメインロジックを実コンパイル済みライブラリで検証する
const { generateBoard, makeRng } = require("/tmp/libjs/board.js");
const { effectForMood, MOODS } = require("/tmp/libjs/effects.js");
const { stageForPoints, calcNpAwarded } = require("/tmp/libjs/growth.js");
const { resolveEffect, landingPosition, rollDice } = require("/tmp/libjs/game.js");
const { weekRange } = require("/tmp/libjs/week.js");
const { HAPPENINGS, happeningsForTheme } = require("/tmp/libjs/data/happenings.js");
const { THEMES } = require("/tmp/libjs/themes.js");

let fail = 0;
function ok(cond, msg) {
  console.log((cond ? "✅ " : "❌ ") + msg);
  if (!cond) fail++;
}

// 気持ち → 効果マッピング (SPEC 4章)
ok(effectForMood("happy").effect_value === 2, "happy → +2");
ok(effectForMood("love").effect_value === 3, "love → +3");
ok(effectForMood("surprised").effect_type === "EXTRA_DICE", "surprised → EXTRA_DICE");
ok(effectForMood("sleepy").effect_type === "SKIP", "sleepy → SKIP");
ok(effectForMood("sad").effect_value === -1, "sad → -1");
ok(effectForMood("angry").effect_value === -2, "angry → -2");
ok(effectForMood(null).effect_type === "NONE", "未設定 → NONE");
ok(MOODS.length === 6, "気持ちは6種類");

// 成長段階 (SPEC 8章)
ok(stageForPoints(0).name === "たまご", "0NP → たまご");
ok(stageForPoints(5).name === "ひよこ", "5NP → ひよこ");
ok(stageForPoints(15).name === "こども", "15NP → こども");
ok(stageForPoints(30).name === "おとな", "30NP → おとな");
ok(stageForPoints(50).name === "ヒーロー", "50NP → ヒーロー");
ok(calcNpAwarded({ hasPhoto: true, hasNote: true }) === 5, "写真+ひとこと → 5NP");

// ハプニングデータ (SPEC 6章)
ok(HAPPENINGS.length === 60, "ハプニング合計60件");
ok(THEMES.length === 6, "テーマ6種類");
for (const t of THEMES) {
  ok(happeningsForTheme(t.id).length === 10, `${t.id} は10件`);
}

// 盤面生成 (SPEC 6章)
const board = generateBoard({
  diaryEntries: [
    { id: "a", effect_type: "MOVE_FORWARD", effect_value: 2 },
    { id: "b", effect_type: "MOVE_BACK", effect_value: -1 },
  ],
  happenings: happeningsForTheme("forest").map((h, i) => ({ id: "h" + i, ...h })),
  happeningCount: 10,
  wishCount: 3,
  rng: makeRng(42),
});
ok(board[0].type === "start", "board[0] = start");
ok(board[board.length - 1].type === "goal", "末尾 = goal");
ok(board.filter((c) => c.type === "diary").length === 2, "日記マス2枚");
ok(board.filter((c) => c.type === "wish").length === 3, "おねがいマス3枚");
ok(board.filter((c) => c.type === "happening").length === 10, "ハプニングマス10枚（テーマの全件）");
ok(board.every((c, i) => c.index === i), "indexが連番");

// 効果解決 (SPEC マス効果)
const fwd = { type: "happening", effect_type: "MOVE_FORWARD", effect_value: 3 };
ok(resolveEffect(fwd, 5, board).newPosition === 8, "MOVE_FORWARD +3 で 5→8");
const back = { type: "happening", effect_type: "MOVE_BACK", effect_value: -2 };
ok(resolveEffect(back, 5, board).newPosition === 3, "MOVE_BACK -2 で 5→3");
ok(resolveEffect(back, 1, board).newPosition === 0, "下限0でクランプ");
const warp = { type: "happening", effect_type: "WARP_START" };
ok(resolveEffect(warp, 9, board).newPosition === 0, "WARP_START → 0");
const skip = { type: "happening", effect_type: "SKIP" };
ok(resolveEffect(skip, 4, board).skipNext === true, "SKIP → skipNext");
const wish = { type: "wish", effect_type: "WISH" };
ok(resolveEffect(wish, 4, board).triggersWish === true, "WISH → triggersWish");

// landing はゴールで頭打ち
const lastIdx = board.length - 1;
ok(landingPosition(lastIdx - 1, 6, board) === lastIdx, "ゴール超過は頭打ち");

// サイコロは1〜6
let diceOk = true;
for (let i = 0; i < 1000; i++) {
  const v = rollDice();
  if (v < 1 || v > 6) diceOk = false;
}
ok(diceOk, "サイコロは常に1〜6");

// 週範囲は月曜〜日曜
const wr = weekRange(new Date("2026-05-26")); // 火曜
ok(wr.start === "2026-05-25" && wr.end === "2026-05-31", `週=月〜日 (${wr.start}〜${wr.end})`);

console.log(fail ? `\n❌ ${fail} 件 失敗` : "\n🎉 すべて通過");
process.exit(fail ? 1 : 0);
