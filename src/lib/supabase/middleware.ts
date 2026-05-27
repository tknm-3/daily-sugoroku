import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = ["/", "/auth", "/family/setup"];

export async function updateSession(request: NextRequest) {
  // クライアントが x-user-id を偽装して送り込むのを防ぐため、受信ヘッダから必ず除去する。
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-id");

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数が未設定でもサイト全体を 500 にせず素通りさせる（設定漏れの切り分け用）。
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser はトークン検証＋期限切れ時のリフレッシュを担うため middleware では必須。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ログイン済みユーザーがトップページを開いたらホームへリダイレクト
  if (user && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // 検証済みの user id を下流のサーバコンポーネントへ渡し、getUser の二重呼び出しを防ぐ。
  if (user) {
    requestHeaders.set("x-user-id", user.id);
    const headerResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });
    supabaseResponse.cookies.getAll().forEach((cookie) =>
      headerResponse.cookies.set(cookie),
    );
    return headerResponse;
  }

  return supabaseResponse;
}
