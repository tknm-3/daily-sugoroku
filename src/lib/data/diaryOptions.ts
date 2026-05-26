import type { ActivityId, LocationId, PartnerId } from "../types";

export interface OptionDef<T extends string> {
  id: T;
  label: string;
  emoji: string;
}

export const LOCATIONS: OptionDef<LocationId>[] = [
  { id: "home", label: "おうち", emoji: "🏠" },
  { id: "school", label: "ようちえん", emoji: "🎒" },
  { id: "park", label: "こうえん", emoji: "🌳" },
  { id: "outing", label: "おでかけ", emoji: "🚗" },
  { id: "other", label: "そのほか", emoji: "✨" },
];

export const PARTNERS: OptionDef<PartnerId>[] = [
  { id: "mama", label: "ママ", emoji: "👩" },
  { id: "papa", label: "パパ", emoji: "👨" },
  { id: "sibling", label: "きょうだい", emoji: "🧒" },
  { id: "friend", label: "おともだち", emoji: "👫" },
  { id: "teacher", label: "せんせい", emoji: "🧑‍🏫" },
  { id: "alone", label: "ひとり", emoji: "🙂" },
  { id: "other", label: "そのほか", emoji: "✨" },
];

export const ACTIVITIES: OptionDef<ActivityId>[] = [
  { id: "play", label: "あそんだ", emoji: "🪀" },
  { id: "eat", label: "たべた", emoji: "🍙" },
  { id: "study", label: "おべんきょう", emoji: "📚" },
  { id: "help", label: "おてつだい", emoji: "🧹" },
  { id: "other", label: "そのほか", emoji: "✨" },
];
