/**
 * Cria uma transferência (saque) da carteira Fusion Pay para uma chave PIX.
 * POST /api/transfer com body: { pix_key, pix_type, amount, postback_url? }
 * pix_type: "cpf" | "cnpj" | "evp" | "phone" | "email"
 * amount: valor em reais (ex: 10.50)
 * Env: FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY, APP_URL (para postback_url se não enviado)
 */
const FUSIONPAY_WITHDRAWAL_URL = "https://api.fusionpay.com.br/v1/wallet-transaction/create/withdrawal";

function cors(res, origin) {
  const o = origin || "*";
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const publicKey = process.env.FUSIONPAY_PUBLIC_KEY;
  const secretKey = process.env.FUSIONPAY_SECRET_KEY;
  const appUrl = process.env.APP_URL || process.env.VERCEL_URL;

  if (!publicKey || !secretKey) {
    return res.status(503).json({
      error: "Fusion Pay não configurado (FUSIONPAY_PUBLIC_KEY e FUSIONPAY_SECRET_KEY).",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { pix_key, pix_type, amount, postback_url } = body;

    if (!pix_key || !pix_type || amount == null) {
      return res.status(400).json({
        error: "Campos obrigatórios: pix_key, pix_type (cpf|cnpj|evp|phone|email), amount (em reais).",
      });
    }

    const validTypes = ["cpf", "cnpj", "evp", "phone", "email"];
    if (!validTypes.includes(pix_type)) {
      return res.status(400).json({
        error: "pix_type deve ser: cpf, cnpj, evp, phone ou email.",
      });
    }

    let postback = postback_url;
    if (!postback && appUrl) {
      const base = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
      postback = base.replace(/\/$/, "") + "/api/webhooks/fusionpay";
    }
    if (!postback) {
      return res.status(400).json({
        error: "Envie postback_url no body ou configure APP_URL nas variáveis de ambiente.",
      });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
    const payload = {
      pix_key: String(pix_key).trim(),
      pix_type,
      amount: Number(amount),
      postback_url: postback,
    };

    const fusionRes = await fetch(FUSIONPAY_WITHDRAWAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(payload),
    });

    const data = await fusionRes.json().catch(() => ({}));

    if (fusionRes.ok) {
      return res.status(200).json({ ok: true, data: data?.data ?? data });
    }

    return res.status(fusionRes.status).json({
      error: data?.message || data?.error || "Erro ao criar transferência",
      details: data,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao criar transferência" });
  }
};
