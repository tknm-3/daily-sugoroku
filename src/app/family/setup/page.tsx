"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/invite";
import type { Role } from "@/lib/types";

const AVATARS = ["🐣", "🐤", "🐥", "🐰", "🐱", "🐶", "🦊", "🐻", "🐸", "🦁", "🐵", "🦄"];

type Mode = "create" | "join";

export default function FamilySetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("create");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [nameJa, setNameJa] = useState("");
  const [avatar, setAvatar] = useState("🐣");
  const [role, setRole] = useState<Role>("child");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      setAuthChecked(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("ログインが確認できませんでした。メールのリンクをクリックしてください。");
        return;
      }

      let familyId: string;

      if (mode === "create") {
        const code = generateInviteCode();
        const { data, error: famErr } = await supabase
          .from("families")
          .insert({ name: familyName, invite_code: code })
          .select("id")
          .single();
        if (famErr || !data) {
          setError(famErr?.message ?? "かぞくグループを つくれませんでした");
          return;
        }
        familyId = data.id;
      } else {
        const { data, error: famErr } = await supabase
          .from("families")
          .select("id")
          .eq("invite_code", inviteCode.toUpperCase())
          .maybeSingle();
        if (famErr || !data) {
          setError("しょうたいコードが みつかりません");
          return;
        }
        familyId = data.id;
      }

      const { error: userErr } = await supabase.from("users").insert({
        id: user.id,
        family_id: familyId,
        name_ja: nameJa,
        role,
        avatar_emoji: avatar,
      });
      if (userErr) {
        setError(userErr.message);
        return;
      }

      router.push("/home");
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-stone-400">よみこみ中...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="text-5xl">📬</div>
        <h1 className="text-2xl font-extrabold text-rose-700">メールを かくにんしてね</h1>
        <p className="text-stone-600">
          とうろく用のメールを おくりました。<br />
          メールのリンクをクリックすると<br />
          つぎのステップに進めます。
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-2xl bg-stone-100 px-6 py-3 font-bold text-stone-600"
        >
          トップにもどる
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 p-6">
      <h1 className="text-2xl font-extrabold text-rose-700">かぞくの せってい</h1>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`flex-1 rounded-2xl py-3 font-bold ${mode === "create" ? "bg-rose-500 text-white" : "bg-stone-100"}`}
        >
          あたらしく つくる
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`flex-1 rounded-2xl py-3 font-bold ${mode === "join" ? "bg-rose-500 text-white" : "bg-stone-100"}`}
        >
          さんかする
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {mode === "create" ? (
          <label className="flex flex-col gap-1">
            <span className="font-bold">かぞくの なまえ</span>
            <input
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="たなかけ"
              className="rounded-2xl border border-stone-200 px-4 py-3 text-lg"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1">
            <span className="font-bold">しょうたいコード（6もじ）</span>
            <input
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="rounded-2xl border border-stone-200 px-4 py-3 text-lg uppercase tracking-widest"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-bold">なまえ（ひらがなOK）</span>
          <input
            required
            value={nameJa}
            onChange={(e) => setNameJa(e.target.value)}
            placeholder="たろう"
            className="rounded-2xl border border-stone-200 px-4 py-3 text-lg"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-bold">あなたの コマ（アバター）</span>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`rounded-2xl py-2 text-3xl ${avatar === a ? "bg-rose-200 ring-2 ring-rose-500" : "bg-stone-100"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold">あなたは？</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("child")}
              className={`flex-1 rounded-2xl py-3 font-bold ${role === "child" ? "bg-rose-500 text-white" : "bg-stone-100"}`}
            >
              こども
            </button>
            <button
              type="button"
              onClick={() => setRole("parent")}
              className={`flex-1 rounded-2xl py-3 font-bold ${role === "parent" ? "bg-rose-500 text-white" : "bg-stone-100"}`}
            >
              おとな
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop bg-rose-500 text-white disabled:opacity-50"
        >
          {loading ? "..." : "はじめる！"}
        </button>
      </form>
    </main>
  );
}
