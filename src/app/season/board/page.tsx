import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import BoardGame, { type PlayerView } from "./BoardGame";
import type { Board, Season, User, WishItem } from "@/lib/types";

export default async function BoardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/family/setup");

  const supabase = await createClient();

  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("family_id", profile.family_id)
    .in("status", ["playing", "finished"])
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle<Season>();

  if (!season || !season.board_json) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6">
        <p className="text-stone-500">まだ ばんめんが ありません</p>
        <Link href="/home" className="btn-pop bg-stone-200">
          ホームへ
        </Link>
      </main>
    );
  }

  const { data: members } = await supabase
    .from("users")
    .select("id, name_ja, avatar_emoji")
    .eq("family_id", profile.family_id);

  const { data: playerRows } = await supabase
    .from("players")
    .select("user_id, position, finished_at")
    .eq("season_id", season.id);

  const positionByUser = new Map(
    (playerRows ?? []).map((p) => [p.user_id, p]),
  );

  const players: PlayerView[] = (members ?? []).map(
    (m: Pick<User, "id" | "name_ja" | "avatar_emoji">) => ({
      user_id: m.id,
      name_ja: m.name_ja,
      avatar_emoji: m.avatar_emoji,
      position: positionByUser.get(m.id)?.position ?? 0,
      finished: !!positionByUser.get(m.id)?.finished_at,
    }),
  );

  const { data: wishRows } = await supabase
    .from("wish_items")
    .select("text_ja, family_id, is_active")
    .or(`family_id.is.null,family_id.eq.${profile.family_id}`)
    .eq("is_active", true);

  const wishes = ((wishRows ?? []) as Pick<WishItem, "text_ja">[]).map(
    (w) => w.text_ja,
  );

  return (
    <BoardGame
      seasonId={season.id}
      themeId={season.theme_id}
      board={season.board_json as Board}
      players={players}
      wishes={wishes}
    />
  );
}
