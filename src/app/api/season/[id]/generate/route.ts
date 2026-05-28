import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBoard } from "@/lib/board";
import type { DiaryEntry, HappeningEvent, Season, User } from "@/lib/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: season } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", id)
    .maybeSingle<Season>();
  if (!season) {
    return NextResponse.json({ error: "season not found" }, { status: 404 });
  }

  // 今週の日記マスを全件収集
  const [{ data: diaryEntries }, { data: happenings }, { data: familyUsers }] =
    await Promise.all([
      supabase
        .from("diary_entries")
        .select("*")
        .eq("family_id", season.family_id)
        .gte("entry_date", season.start_date)
        .lte("entry_date", season.end_date),
      supabase
        .from("happening_events")
        .select("*")
        .eq("theme_id", season.theme_id),
      supabase
        .from("users")
        .select("id, name_ja, avatar_emoji")
        .eq("family_id", season.family_id),
    ]);

  const userMap = new Map(
    ((familyUsers ?? []) as Pick<User, "id" | "name_ja" | "avatar_emoji">[]).map(
      (u) => [u.id, { name_ja: u.name_ja, avatar_emoji: u.avatar_emoji }],
    ),
  );

  const board = generateBoard({
    diaryEntries: (diaryEntries ?? []) as DiaryEntry[],
    happenings: (happenings ?? []) as HappeningEvent[],
    users: userMap,
  });

  const { error: updErr } = await supabase
    .from("seasons")
    .update({ board_json: board, status: "playing" })
    .eq("id", id);
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // 家族メンバー全員のプレイヤー状態を作成（スタート位置）
  if (familyUsers && familyUsers.length > 0) {
    const rows = (familyUsers as Pick<User, "id">[]).map((m) => ({
      season_id: id,
      user_id: m.id,
      position: 0,
    }));
    await supabase.from("players").upsert(rows, { onConflict: "season_id,user_id" });
  }

  return NextResponse.json({ ok: true });
}
