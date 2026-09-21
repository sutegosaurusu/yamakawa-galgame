// =====================================================
// サイト全体にID・パスワードを要求するEdge Function
//
// Netlifyの管理画面で環境変数
//   BASIC_AUTH_USER     (例: friend)
//   BASIC_AUTH_PASSWORD (例: 好きなパスワード)
// を設定してから使う。
// =====================================================

export default async (request: Request) => {

  const user =
    Deno.env.get("BASIC_AUTH_USER");

  const pass =
    Deno.env.get("BASIC_AUTH_PASSWORD");

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