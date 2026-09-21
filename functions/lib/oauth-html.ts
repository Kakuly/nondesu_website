/** Decap CMS popup expects this postMessage format after GitHub OAuth. */
export function oauthSuccessPage(token: string): string {
  const payload = JSON.stringify({ token, provider: "github" });

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Decap CMS — 認証中</title>
  </head>
  <body>
    <p>認証が完了しました。このウィンドウは自動で閉じます。</p>
    <script>
      (function () {
        var content = ${JSON.stringify(payload)};
        function receiveMessage(event) {
          window.opener.postMessage("authorization:github:success:" + content, event.origin);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;
}

export function oauthErrorPage(message: string): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Decap CMS — 認証エラー</title>
  </head>
  <body>
    <p>認証に失敗しました: ${message}</p>
    <p>このウィンドウを閉じて、もう一度ログインしてください。</p>
  </body>
</html>`;
}
