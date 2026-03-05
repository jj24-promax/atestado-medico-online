/**
 * Webhook da Fusion Pay (notificação de pagamento PIX).
 * A Fusion Pay chama esta URL quando o status da transação muda.
 * Env: nenhum obrigatório (apenas recebe POST e responde 200).
 */
function cors(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res, req.headers.origin);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    // Id, Status, etc. — pode ser usado no futuro para notificações
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true });
  }
};
