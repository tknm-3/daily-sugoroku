import { createClient } from "./supabase/server";
import type { User } from "./types";

/** 認証済みユーザーの users プロフィールを取得。未作成なら null。 */
export async function getCurrentProfile(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as User | null) ?? null;
}
