// 直近10件にメッセージを足す純粋関数。1〜10文字のみ許可、それ以外は null。
export function addMessage(list, text) {
  const t = String(text ?? "").trim();
  if (!t || [...t].length > 10) return null;
  return [{ text: t, at: Date.now() }, ...list].slice(0, 10);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/messages") {
      if (request.method === "GET") {
        return Response.json((await env.MESSAGES.get("m", "json")) ?? []);
      }
      if (request.method === "POST") {
        const { text } = await request.json();
        // ponytail: 1キーの read-modify-write で非アトミック。同時書き込みが
        // 重なると1件取りこぼす。個人サイトなら許容。増えたら D1 へ。
        const next = addMessage((await env.MESSAGES.get("m", "json")) ?? [], text);
        if (!next) return new Response("1〜10文字で入力してください", { status: 400 });
        await env.MESSAGES.put("m", JSON.stringify(next));
        return Response.json({ ok: true });
      }
    }
    return env.ASSETS.fetch(request); // それ以外は静的ファイル
  },
};
