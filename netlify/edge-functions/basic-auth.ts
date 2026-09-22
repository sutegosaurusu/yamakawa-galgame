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
// ・日本語(漢字)を含むID・パスワードでも
//   btoaがクラッシュしないようにした。
//   (btoaはUTF-8の日本語をそのまま扱えないため、
//   一度バイト列に変換してから渡す)
// =====================================================

function getEnv(key: string): string | undefined {

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


/* =====================================================
   日本語(漢字)を含む文字列でも安全にBase64化する

   btoaはUTF-8の文字をそのまま渡すとエラーになるため、
   一度バイト列(Latin1相当の文字列)に変換してから渡す。
===================================================== */

function base64EncodeUtf8(text: string): string {

  const bytes = new TextEncoder().encode(text);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
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
    "Basic " + base64EncodeUtf8(`${user}:${pass}`);

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
