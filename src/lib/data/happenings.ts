import type { EffectType, ThemeId } from "../types";

export interface HappeningSeed {
  theme_id: ThemeId;
  title_ja: string;
  effect_type: EffectType;
  effect_value: number | null;
  emoji: string;
}

/** SPEC 6章: ハプニングマス（テーマ別・各10件）のマスターデータ */
export const HAPPENINGS: HappeningSeed[] = [
  // 🌳 もりのたんけん
  { theme_id: "forest", title_ja: "こびとにみちを教えてもらった！", effect_type: "MOVE_FORWARD", effect_value: 3, emoji: "🧚" },
  { theme_id: "forest", title_ja: "おおかみにおいかけられた！", effect_type: "WARP_START", effect_value: null, emoji: "🐺" },
  { theme_id: "forest", title_ja: "まほうのきのみを食べた！", effect_type: "EXTRA_DICE", effect_value: null, emoji: "🍓" },
  { theme_id: "forest", title_ja: "きが急に歩き出した！", effect_type: "MOVE_ALL", effect_value: 2, emoji: "🌲" },
  { theme_id: "forest", title_ja: "ようせいがいたずらした！", effect_type: "SWAP", effect_value: null, emoji: "🧚‍♀️" },
  { theme_id: "forest", title_ja: "ぬかるみにはまった！", effect_type: "SKIP", effect_value: null, emoji: "💦" },
  { theme_id: "forest", title_ja: "たからの地図を発見！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🗺️" },
  { theme_id: "forest", title_ja: "まほうの泉を発見！", effect_type: "FREE_MOVE", effect_value: null, emoji: "⛲" },
  { theme_id: "forest", title_ja: "もりのおうちで道に迷った", effect_type: "MOVE_BACK", effect_value: -2, emoji: "🏚️" },
  { theme_id: "forest", title_ja: "にじいろのちょうちょが道案内", effect_type: "EXTRA_DICE", effect_value: null, emoji: "🦋" },

  // 🚀 うちゅうぼうけん
  { theme_id: "space", title_ja: "ブラックホールに吸い込まれた！", effect_type: "MOVE_BACK", effect_value: -5, emoji: "🕳️" },
  { theme_id: "space", title_ja: "うちゅう人とともだちになった！", effect_type: "FREE_MOVE", effect_value: null, emoji: "👽" },
  { theme_id: "space", title_ja: "いんせきをよけた！", effect_type: "EXTRA_DICE", effect_value: null, emoji: "☄️" },
  { theme_id: "space", title_ja: "無重力でういた！", effect_type: "SKIP", effect_value: null, emoji: "🧑‍🚀" },
  { theme_id: "space", title_ja: "宇宙ステーションを発見！", effect_type: "MOVE_FORWARD", effect_value: 4, emoji: "🛰️" },
  { theme_id: "space", title_ja: "ロケットエンジンこしょう", effect_type: "MOVE_BACK", effect_value: -3, emoji: "🚀" },
  { theme_id: "space", title_ja: "星の王子様と出会った！", effect_type: "MOVE_ALL", effect_value: 2, emoji: "🤴" },
  { theme_id: "space", title_ja: "宇宙海賊が現れた！", effect_type: "SWAP", effect_value: null, emoji: "🏴‍☠️" },
  { theme_id: "space", title_ja: "流れ星に乗った！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🌠" },
  { theme_id: "space", title_ja: "宇宙人の歌を聞いた", effect_type: "EXTRA_DICE", effect_value: null, emoji: "🎶" },

  // 🌊 うみのぼうけん
  { theme_id: "ocean", title_ja: "人魚が歌ってくれた！", effect_type: "MOVE_FORWARD", effect_value: 3, emoji: "🧜‍♀️" },
  { theme_id: "ocean", title_ja: "サメに追いかけられた！", effect_type: "SKIP", effect_value: null, emoji: "🦈" },
  { theme_id: "ocean", title_ja: "たからばこを発見！", effect_type: "MOVE_ALL", effect_value: 2, emoji: "💰" },
  { theme_id: "ocean", title_ja: "たこに足をつかまれた！", effect_type: "SWAP", effect_value: null, emoji: "🐙" },
  { theme_id: "ocean", title_ja: "波に乗って飛んだ！", effect_type: "EXTRA_DICE", effect_value: null, emoji: "🌊" },
  { theme_id: "ocean", title_ja: "あらしが来た！", effect_type: "MOVE_BACK", effect_value: -4, emoji: "⛈️" },
  { theme_id: "ocean", title_ja: "海の女王様に会った", effect_type: "FREE_MOVE", effect_value: null, emoji: "👸" },
  { theme_id: "ocean", title_ja: "くじらの背中で昼寝した", effect_type: "SKIP", effect_value: null, emoji: "🐋" },
  { theme_id: "ocean", title_ja: "光る魚に案内された", effect_type: "MOVE_FORWARD", effect_value: 3, emoji: "🐠" },
  { theme_id: "ocean", title_ja: "海底神殿を発見！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🏛️" },

  // 🏠 まほうのおうち
  { theme_id: "home", title_ja: "ぬいぐるみが夜中に動いてた！", effect_type: "SKIP", effect_value: null, emoji: "🧸" },
  { theme_id: "home", title_ja: "れいぞうこがおかしであふれた！", effect_type: "MOVE_ALL", effect_value: 3, emoji: "🍫" },
  { theme_id: "home", title_ja: "かくしドアを発見！", effect_type: "FREE_MOVE", effect_value: null, emoji: "🚪" },
  { theme_id: "home", title_ja: "まほうのほうきが暴走！", effect_type: "MOVE_BACK", effect_value: -3, emoji: "🧹" },
  { theme_id: "home", title_ja: "テーブルが空を飛んだ！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🪑" },
  { theme_id: "home", title_ja: "おふろが温泉になった！", effect_type: "EXTRA_DICE", effect_value: null, emoji: "♨️" },
  { theme_id: "home", title_ja: "鏡の中に入れた！", effect_type: "SWAP", effect_value: null, emoji: "🪞" },
  { theme_id: "home", title_ja: "おもちゃが反乱した！", effect_type: "MOVE_BACK", effect_value: -2, emoji: "🤖" },
  { theme_id: "home", title_ja: "にわから宝が出てきた！", effect_type: "MOVE_ALL", effect_value: 2, emoji: "💎" },
  { theme_id: "home", title_ja: "まどからにじの橋が出た", effect_type: "FREE_MOVE", effect_value: null, emoji: "🌈" },

  // 🦸 ヒーローとかいじゅう
  { theme_id: "hero", title_ja: "かいじゅう出現！", effect_type: "MOVE_BACK", effect_value: -3, emoji: "🦖" },
  { theme_id: "hero", title_ja: "ヒーローに変身！", effect_type: "EXTRA_DICE", effect_value: 2, emoji: "🦸" },
  { theme_id: "hero", title_ja: "秘密基地を発見！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🏰" },
  { theme_id: "hero", title_ja: "悪者にやられた！", effect_type: "SKIP", effect_value: null, emoji: "👹" },
  { theme_id: "hero", title_ja: "必殺技が決まった！", effect_type: "MOVE_ALL", effect_value: 3, emoji: "💥" },
  { theme_id: "hero", title_ja: "仲間を助けた！", effect_type: "FREE_MOVE", effect_value: null, emoji: "🤝" },
  { theme_id: "hero", title_ja: "わなにかかった！", effect_type: "MOVE_BACK", effect_value: -2, emoji: "🪤" },
  { theme_id: "hero", title_ja: "新しい武器をゲット！", effect_type: "EXTRA_DICE", effect_value: null, emoji: "⚔️" },
  { theme_id: "hero", title_ja: "変装がバレた！", effect_type: "SWAP", effect_value: null, emoji: "🥸" },
  { theme_id: "hero", title_ja: "街を守った！", effect_type: "MOVE_FORWARD", effect_value: 4, emoji: "🏙️" },

  // 🌈 ゆめのくに
  { theme_id: "dream", title_ja: "空を飛んだ！", effect_type: "FREE_MOVE", effect_value: null, emoji: "🕊️" },
  { theme_id: "dream", title_ja: "ケーキの山を発見！", effect_type: "MOVE_ALL", effect_value: 3, emoji: "🍰" },
  { theme_id: "dream", title_ja: "時計が逆に動いた", effect_type: "MOVE_BACK", effect_value: -3, emoji: "🕰️" },
  { theme_id: "dream", title_ja: "しゃべる動物が道案内", effect_type: "EXTRA_DICE", effect_value: null, emoji: "🦊" },
  { theme_id: "dream", title_ja: "おかしの雨が降った！", effect_type: "MOVE_ALL", effect_value: 2, emoji: "🍬" },
  { theme_id: "dream", title_ja: "夢の中でまた夢を見た", effect_type: "MOVE_BACK", effect_value: -2, emoji: "💤" },
  { theme_id: "dream", title_ja: "まほうのつえを手に入れた！", effect_type: "MOVE_FORWARD", effect_value: 5, emoji: "🪄" },
  { theme_id: "dream", title_ja: "夢から覚めそうになった", effect_type: "SKIP", effect_value: null, emoji: "😪" },
  { theme_id: "dream", title_ja: "にじの橋を渡った！", effect_type: "MOVE_FORWARD", effect_value: 4, emoji: "🌉" },
  { theme_id: "dream", title_ja: "しあわせのようせいに会えた！", effect_type: "SWAP", effect_value: null, emoji: "🧚" },
];

export function happeningsForTheme(theme: ThemeId): HappeningSeed[] {
  return HAPPENINGS.filter((h) => h.theme_id === theme);
}
