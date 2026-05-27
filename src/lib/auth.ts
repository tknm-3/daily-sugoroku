import { headers } from "next/headers";
import { createClient } from "./supabase/server";
import type { User } from "./types";

/**
 * 認証済みユーザーの id を取得。
 * middleware が検証済みの id をヘッダに載せるため、通常はネットワーク往復なしで済む。
 * ヘッダが無い場合のみ getUser にフォールバックする。
 */
export async function getUserId(): Promise<string | null> {
  const fromHeader = (await headers()).get("x-user-id");
  if (fromHeader) return fromHeader;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** 認証済みユーザーの users プロフィールを取得。未作成なら null。 */
export async function getCurrentProfile(): Promise<User | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as User | null) ?? null;
}
