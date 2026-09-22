// =====================================================
// サイト全体にID・パスワードを要求するEdge Function
//
// Netlifyの管理画面で環境変数
//   BASIC_AUTH_USER     (例: friend)
//   BASIC_AUTH_PASSWORD (例: 好きなパスワード)
// を設定してから使う。
//
// ※修正点:
// ・Netlify.env の呼び出しでエラーが起きても
//   クラッシュせず、Deno.env にフォールバックするようにした。
// ・認証OK時は context.next() を明示的に呼ぶようにした。
// =====================================================

function getEnv(key: string): string | undefined {

  // 新しい書き方(Netlify.env)を試す。
  // ここで何か例外が起きても、クラッシュさせずに
  // 従来の書き方(Deno.env)へフォールバックする。
  try {

    // @ts-ignore
    if (typeof Netlify !== "undefined" && Netlify && Netlify.env) {

      // @ts-ignore
      const value = Netlify.env.get(key);

      if (value) {
        return value;
      }
    }

  } catch (_error) {
    // 何もしない(下のDeno.envへ進む)
  }

  try {
    return Deno.env.get(key);
  } catch (_error) {
    return undefined;
  }
}

export default async (request: Request, context: any) => {

  const user = getEnv("BASIC_AUTH_USER");
  const pass = getEnv("BASIC_AUTH_PASSWORD");

  // 環境変数が未設定の場合は、
  // 誤って全公開にならないよう常にブロックする
  if (!user || !pass) {
    return new Response(
      "認証設定が未完了です(環境変数が未設定)",
      { status: 500 }
    );
  }

  const authHeader =
    request.headers.get("authorization");

  const expected =
    "Basic " + btoa(`${user}:${pass}`);

  if (authHeader === expected) {

    // 認証OK → 元々のページをそのまま返す
    if (context && typeof context.next === "function") {
      return context.next();
    }

    return;
  }

  // 認証NG → ブラウザ標準のID/パスワード入力欄を表示させる
  return new Response(
    "認証が必要です",
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Protected Area"'
      }
    }
  );
};

export const config = {
  path: "/*"
};
