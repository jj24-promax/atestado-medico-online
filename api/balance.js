/**
 * Consulta o saldo da carteira Fusion Pay.
 * GET /api/balance
 * Env: FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY
 * Resposta: saldo em centavos em data.amount (ou estrutura retornada pela API).
 */
const FUSIONPAY_BALANCE_URL = "https://api.fusionpay.com.br/v1/dashboard/balance";

function cors(res, origin) {
  const o = origin || "*";
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "GET") {
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
    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    const fusionRes = await fetch(FUSIONPAY_BALANCE_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + auth,
      },
    });

    const data = await fusionRes.json().catch(() => ({}));

    if (fusionRes.ok) {
      return res.status(200).json({ ok: true, data: data?.data ?? data });
    }

    return res.status(fusionRes.status).json({
      error: data?.message || data?.error || "Erro ao consultar saldo",
      details: data,
    });
  } catch (e) {
    return res.status(500).json({ error: "Erro ao consultar saldo" });
  }
};
