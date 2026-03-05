/**
 * Estorna uma transação na Fusion Pay.
 * POST /api/refund com body: { "transactionId": "id-da-transacao" }
 * Env: FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY
 */
const FUSIONPAY_REFUND_URL = "https://api.fusionpay.com.br/v1/payment-transaction";

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
  if (!publicKey || !secretKey) {
    return res.status(503).json({
      error: "Fusion Pay não configurado (FUSIONPAY_PUBLIC_KEY e FUSIONPAY_SECRET_KEY).",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const id = (body.transactionId || body.id || "").trim();
    if (!id) {
      return res.status(400).json({ error: "Envie transactionId no body (id da transação)." });
    }

    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");
    const url = `${FUSIONPAY_REFUND_URL}/${encodeURIComponent(id)}/refund`;

    const fusionRes = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + auth,
      },
    });

    if (fusionRes.ok) {
      const data = await fusionRes.json().catch(() => ({}));
      return res.status(200).json({ ok: true, ...data });
    }

    const data = await fusionRes.json().catch(() => ({}));
    return res.status(fusionRes.status).json({
      error: data?.message || data?.error || "Erro ao estornar",
      details: data,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao estornar transação" });
  }
};
