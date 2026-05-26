"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateBoardButton({ seasonId }: { seasonId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/season/${seasonId}/generate`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ばんめんを つくれませんでした");
      setLoading(false);
      return;
    }
    router.push("/season/board");
  }

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-2xl bg-white/80 px-4 py-2 font-bold disabled:opacity-50"
      >
        {loading ? "つくってるよ..." : "ばんめんを つくる"}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
