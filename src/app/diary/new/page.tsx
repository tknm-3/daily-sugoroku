"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOODS, effectForMood } from "@/lib/effects";
import { calcNpAwarded } from "@/lib/growth";
import { LOCATIONS, PARTNERS, ACTIVITIES } from "@/lib/data/diaryOptions";
import type {
  ActivityId,
  LocationId,
  Mood,
  PartnerId,
  User,
} from "@/lib/types";

type Mode = "child" | "parent";

export default function DiaryNewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("child");
  const [profile, setProfile] = useState<User | null>(null);

  const [mood, setMood] = useState<Mood | null>(null);
  const [location, setLocation] = useState<LocationId | null>(null);
  const [partner, setPartner] = useState<PartnerId | null>(null);
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      const { data: p } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle<User>();
      if (!p) {
        router.push("/family/setup");
        return;
      }
      setProfile(p);
      setMode(p.role === "parent" ? "parent" : "child");
    });
  }, [router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const effect = effectForMood(mood);
    const hasNote = note.trim().length > 0;
    const np = calcNpAwarded({ hasNote });

    const { error: insErr } = await supabase.from("diary_entries").insert({
      family_id: profile.family_id,
      user_id: profile.id,
      entry_date: new Date().toISOString().slice(0, 10),
      mood,
      location,
      partner,
      activity,
      note_text: hasNote ? note.trim() : null,
      effect_type: effect.effect_type,
      effect_value: effect.effect_value,
      np_awarded: np,
    });

    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }

    await supabase
      .from("users")
      .update({ nobi_points: profile.nobi_points + np })
      .eq("id", profile.id);

    router.push("/home");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-rose-700">きょうの 日記</h1>
        <div className="flex gap-1 rounded-2xl bg-stone-100 p-1">
          <button
            onClick={() => setMode("child")}
            className={`rounded-xl px-3 py-1 text-sm font-bold ${mode === "child" ? "bg-white shadow" : "text-stone-500"}`}
          >
            こども
          </button>
          <button
            onClick={() => setMode("parent")}
            className={`rounded-xl px-3 py-1 text-sm font-bold ${mode === "parent" ? "bg-white shadow" : "text-stone-500"}`}
          >
            おとな
          </button>
        </div>
      </div>

      <Section title="きょうの きもちは？">
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((m) => (
            <ChipButton
              key={m.id}
              selected={mood === m.id}
              onClick={() => setMood(mood === m.id ? null : m.id)}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs">{m.label}</span>
            </ChipButton>
          ))}
        </div>
      </Section>

      {mode === "child" && (
        <>
          <Section title="どこで？">
            <ChipRow
              options={LOCATIONS}
              selected={location}
              onSelect={(id) => setLocation(location === id ? null : id)}
            />
          </Section>
          <Section title="だれと？">
            <ChipRow
              options={PARTNERS}
              selected={partner}
              onSelect={(id) => setPartner(partner === id ? null : id)}
            />
          </Section>
          <Section title="なにした？">
            <ChipRow
              options={ACTIVITIES}
              selected={activity}
              onSelect={(id) => setActivity(activity === id ? null : id)}
            />
          </Section>
        </>
      )}

      <Section title={mode === "child" ? "ひとこと（にんい）" : "きょうの できごと"}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={mode === "parent" ? 5 : 3}
          placeholder={mode === "parent" ? "じゆうに かいてね" : "おとなに かいてもらってもOK"}
          className="w-full rounded-2xl border border-stone-200 p-3 text-lg"
        />
      </Section>

      <p className="text-center text-xs text-stone-400">
        📷 しゃしんは Phase 2 で ついか よてい
      </p>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !profile}
        className="btn-pop bg-rose-500 text-white disabled:opacity-50"
      >
        {saving ? "..." : "かいた！"}
      </button>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-bold text-stone-700">{title}</h2>
      {children}
    </section>
  );
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl py-3 transition ${selected ? "bg-rose-200 ring-2 ring-rose-500" : "bg-stone-100"}`}
    >
      {children}
    </button>
  );
}

function ChipRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { id: T; label: string; emoji: string }[];
  selected: T | null;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onSelect(o.id)}
          className={`flex items-center gap-1 rounded-2xl px-4 py-2 ${selected === o.id ? "bg-rose-200 ring-2 ring-rose-500" : "bg-stone-100"}`}
        >
          <span className="text-xl">{o.emoji}</span>
          <span className="text-sm font-bold">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
