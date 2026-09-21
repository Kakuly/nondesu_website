interface ContactPayload {
  requestType?: string;
  summary?: string;
  budget?: string;
  deadline?: string;
  contact?: string;
  name?: string;
}

interface Env {
  CONTACT_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: "JSON の形式が正しくありません。" }, { status: 400 });
  }

  if (!payload.requestType || !payload.summary || !payload.contact) {
    return Response.json(
      { ok: false, message: "依頼種別・内容・連絡先は必須です。" },
      { status: 400 },
    );
  }

  const recipient = env.CONTACT_EMAIL ?? "nondesu0816@gmail.com";
  const subject = encodeURIComponent(`[nondesu 依頼] ${payload.requestType}`);
  const body = encodeURIComponent(
    [
      `依頼種別: ${payload.requestType}`,
      `お名前: ${payload.name ?? "（未入力）"}`,
      `連絡先: ${payload.contact}`,
      `予算感: ${payload.budget ?? "（未入力）"}`,
      `希望納期: ${payload.deadline ?? "（未入力）"}`,
      "",
      "依頼内容:",
      payload.summary,
    ].join("\n"),
  );

  // MailChannels 等のメール送信は本番環境変数設定後に有効化できます。
  // 現段階では mailto フォールバック用の成功レスポンスとログで受け付けます。
  console.log("Commission inquiry", { recipient, payload });

  return Response.json({
    ok: true,
    message: "送信を受け付けました。のんですから返信がありますので少々お待ちください。",
    mailto: `mailto:${recipient}?subject=${subject}&body=${body}`,
  });
}
