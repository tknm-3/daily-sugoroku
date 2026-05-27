import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { stageForPoints } from "@/lib/growth";
import { getTheme } from "@/lib/themes";
import GenerateBoardButton from "./GenerateBoardButton";
import type { Family, Season } from "@/lib/types";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/family/setup");

  const supabase = await createClient();

  const [{ data: family }, { data: season }] = await Promise.all([
    supabase
      .from("families")
      .select("*")
      .eq("id", profile.family_id)
      .maybeSingle<Family>(),
    supabase
      .from("seasons")
      .select("*")
      .eq("family_id", profile.family_id)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle<Season>(),
  ]);

  const stage = stageForPoints(profile.nobi_points);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">{family?.name}</p>
          <h1 className="text-xl font-extrabold">
            {profile.avatar_emoji} {profile.name_ja} の すごろく
          </h1>
        </div>
        <Link href="/profile" className="rounded-2xl bg-stone-100 px-3 py-2 text-2xl">
          {stage.emoji}
        </Link>
      </header>

      {family && (
        <div className="rounded-2xl bg-amber-50 p-3 text-center text-sm">
          しょうたいコード:{" "}
          <span className="font-mono text-lg font-bold tracking-widest">
            {family.invite_code}
          </span>
        </div>
      )}

      <section className="rounded-3xl bg-white p-5 shadow">
        <h2 className="mb-2 font-bold text-stone-700">こんしゅうの すごろく</h2>
        {season ? (
          <SeasonCard season={season} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-stone-500">まだ シーズンが ありません</p>
            <Link href="/season/theme" className="btn-pop bg-emerald-500 text-white">
              テーマを えらぶ
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3">
        <Link href="/diary/new" className="btn-pop bg-rose-500 text-center text-white">
          📔 きょうの 日記を かく
        </Link>
        {season && season.status !== "preparing" && (
          <Link
            href="/season/board"
            className="btn-pop bg-violet-500 text-center text-white"
          >
            🎲 すごろくで あそぶ
          </Link>
        )}
      </div>
    </main>
  );
}

function SeasonCard({ season }: { season: Season }) {
  const theme = getTheme(season.theme_id);
  const statusLabel: Record<Season["status"], string> = {
    preparing: "じゅんびちゅう",
    playing: "プレイできるよ！",
    finished: "おわったよ",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${theme.gradient} p-4`}>
      <div className="text-3xl">{theme.emoji}</div>
      <p className="mt-1 font-bold">{theme.name}</p>
      <p className="text-sm text-stone-600">
        {season.start_date} 〜 {season.end_date}
      </p>
      <p className="mt-1 text-sm font-bold text-stone-700">
        {statusLabel[season.status]}
      </p>
      {season.status === "preparing" && <GenerateBoardButton seasonId={season.id} />}
    </div>
  );
}
