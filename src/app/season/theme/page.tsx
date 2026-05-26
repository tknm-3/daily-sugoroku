"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { THEMES } from "@/lib/themes";
import { weekRange } from "@/lib/week";
import type { ThemeId, User } from "@/lib/types";

export default function ThemeSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ThemeId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<User>();
    if (!profile) {
      router.push("/family/setup");
      return;
    }

    const { start, end } = weekRange();
    const { error: insErr } = await supabase.from("seasons").insert({
      family_id: profile.family_id,
      theme_id: selected,
      start_date: start,
      end_date: end,
      status: "preparing",
    });
    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }
    router.push("/home");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-emerald-700">テーマを えらぼう</h1>
        <p className="text-sm text-stone-500">こんしゅうの すごろくの せかいを えらんでね</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`flex flex-col items-center gap-2 rounded-3xl bg-gradient-to-br ${t.gradient} p-5 shadow transition ${selected === t.id ? "ring-4 ring-emerald-500" : ""}`}
          >
            <span className="text-5xl">{t.emoji}</span>
            <span className="font-bold text-stone-700">{t.name}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        onClick={handleStart}
        disabled={!selected || saving}
        className="btn-pop bg-emerald-500 text-white disabled:opacity-40"
      >
        {saving ? "..." : "このテーマで はじめる"}
      </button>
    </main>
  );
}
