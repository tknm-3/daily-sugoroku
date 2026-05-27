"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function TopPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 10000),
    );

    try {
      if (mode === "signup") {
        const { error } = await Promise.race([
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${location.origin}/auth/callback?next=/family/setup`,
            },
          }),
          timeout,
        ]);
        if (error) {
          setMessage(error.message);
        } else {
          router.push("/family/setup");
        }
      } else {
        const { error } = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeout,
        ]);
        if (error) {
          setMessage(error.message);
        } else {
          router.push("/home");
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message === "timeout") {
        setMessage("サーバーに接続できませんでした。時間をおいて再度お試しください。");
      } else {
        setMessage("エラーが発生しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-gradient-to-b from-amber-100 to-rose-100 p-6">
      <div className="text-center">
        <div className="text-6xl">🎲📔</div>
        <h1 className="mt-3 text-3xl font-extrabold text-rose-700">日記すごろく</h1>
        <p className="mt-2 text-sm text-stone-600">かぞくの日記が すごろくになる！</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-lg"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-2xl py-2 font-bold ${mode === "login" ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-500"}`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-2xl py-2 font-bold ${mode === "signup" ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-500"}`}
          >
            しんき登録
          </button>
        </div>

        <input
          type="email"
          required
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-stone-200 px-4 py-3 text-lg"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-stone-200 px-4 py-3 text-lg"
        />

        {message && <p className="text-sm text-rose-600">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop bg-rose-500 text-white disabled:opacity-50"
        >
          {loading ? "..." : mode === "login" ? "ログイン" : "登録する"}
        </button>
      </form>
    </main>
  );
}
