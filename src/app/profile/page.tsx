import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  GROWTH_STAGES,
  stageForPoints,
  pointsToNextStage,
} from "@/lib/growth";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/family/setup");

  const stage = stageForPoints(profile.nobi_points);
  const toNext = pointsToNextStage(profile.nobi_points);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-rose-700">プロフィール</h1>
        <Link href="/home" className="rounded-2xl bg-stone-100 px-4 py-2 font-bold">
          ← ホーム
        </Link>
      </header>

      <section className="flex flex-col items-center gap-2 rounded-3xl bg-white p-6 shadow">
        <div className="text-7xl">{stage.emoji}</div>
        <p className="text-xl font-extrabold">
          {profile.avatar_emoji} {profile.name_ja}
        </p>
        <p className="rounded-full bg-amber-100 px-4 py-1 font-bold text-amber-700">
          {stage.name}（{stage.description}）
        </p>
        <p className="text-lg">
          のびっこポイント: <span className="font-extrabold">{profile.nobi_points}</span> NP
        </p>
        {toNext !== null ? (
          <p className="text-sm text-stone-500">つぎの だんかいまで あと {toNext} NP</p>
        ) : (
          <p className="text-sm text-stone-500">さいこうの すがた！</p>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow">
        <h2 className="mb-3 font-bold text-stone-700">せいちょうの だんかい</h2>
        <ul className="flex flex-col gap-2">
          {GROWTH_STAGES.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${s.id === stage.id ? "bg-rose-100 ring-2 ring-rose-300" : "bg-stone-50"}`}
            >
              <span className="text-3xl">{s.emoji}</span>
              <div className="flex-1">
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-stone-500">{s.description}</p>
              </div>
              <span className="text-sm text-stone-400">
                {s.minNp}
                {s.maxNp === null ? "〜" : `〜${s.maxNp}`} NP
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
