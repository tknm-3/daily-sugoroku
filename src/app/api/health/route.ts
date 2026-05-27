import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 環境変数がビルド/ランタイムに届いているかの診断用。秘密値は出さない。
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return NextResponse.json({
    urlSet: url.length > 0,
    urlPrefix: url.slice(0, 20),
    urlLooksValid: url.startsWith("https://") && url.includes(".supabase.co"),
    anonKeySet: key.length > 0,
    anonKeyLength: key.length,
    anonKeyPrefix: key.slice(0, 6),
  });
}
