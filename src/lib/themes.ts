import type { ThemeId } from "./types";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  emoji: string;
  /** Tailwind gradient classes for the board background. */
  gradient: string;
  /** Short cheerful message shown on the goal cell. */
  goalMessage: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: "forest",
    name: "もりのたんけん",
    emoji: "🌳",
    gradient: "from-green-200 via-emerald-100 to-lime-200",
    goalMessage: "もりのおくの たからばこ、はっけん！",
  },
  {
    id: "space",
    name: "うちゅうぼうけん",
    emoji: "🚀",
    gradient: "from-indigo-300 via-purple-200 to-slate-300",
    goalMessage: "ほしの むこうまで とどいたよ！",
  },
  {
    id: "ocean",
    name: "うみのぼうけん",
    emoji: "🌊",
    gradient: "from-sky-200 via-cyan-100 to-blue-200",
    goalMessage: "うみの ていの しんでんに ついた！",
  },
  {
    id: "home",
    name: "まほうのおうち",
    emoji: "🏠",
    gradient: "from-amber-100 via-orange-100 to-rose-200",
    goalMessage: "おうちじゅうが まほうで キラキラ！",
  },
  {
    id: "hero",
    name: "ヒーローとかいじゅう",
    emoji: "🦸",
    gradient: "from-red-200 via-yellow-100 to-orange-200",
    goalMessage: "まちを まもった ヒーロー！",
  },
  {
    id: "dream",
    name: "ゆめのくに",
    emoji: "🌈",
    gradient: "from-pink-200 via-fuchsia-100 to-violet-200",
    goalMessage: "ゆめのくにで みんなと しあわせ！",
  },
];

const THEME_MAP = new Map<ThemeId, ThemeDef>(THEMES.map((t) => [t.id, t]));

export function getTheme(id: ThemeId): ThemeDef {
  const theme = THEME_MAP.get(id);
  if (!theme) {
    throw new Error(`Unknown theme: ${id}`);
  }
  return theme;
}
