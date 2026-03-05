/**
 * Serverless: cria transação PIX na Fusion Pay.
 * Chamado pelo formulário do site (mesmo domínio em produção).
 * Env: FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY, APP_URL (para webhook)
 */
const FUSIONPAY_URL = "https://api.fusionpay.com.br/v1/payment-transaction/create";

function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function formatPhone(phone) {
  const digits = onlyDigits(phone || "");
  if (digits.length === 11 && !digits.startsWith("0")) return "+55" + digits;
  if (digits.length === 10) return "+55" + digits;
  return (phone || "").startsWith("+") ? phone : "+55" + digits;
}

function cors(res, origin) {
  const o = origin || "*";
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
      error: "Fusion Pay não configurado. Defina FUSIONPAY_PUBLIC_KEY e FUSIONPAY_SECRET_KEY nas variáveis de ambiente.",
    });
  }

  let postbackUrl = null;
  if (appUrl) {
    const base = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
    postbackUrl = base.replace(/\/$/, "") + "/api/webhooks/fusionpay";
  }
  if (!postbackUrl) {
    return res.status(503).json({
      error: "Configure APP_URL ou VERCEL_URL para o webhook da Fusion Pay.",
    });
  }

  try {
    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    } catch (_) {
      return res.status(400).json({ error: "Body da requisição inválido (JSON esperado)." });
    }
    const { amount, name, email, cpf, phone, itemTitle } = body;
    if (!amount || !name || !email) {
      return res.status(400).json({
        error: "Campos obrigatórios: amount, name, email.",
      });
    }

    const amountCents = Math.round(Number(amount) * 100);
    const cpfDigits = onlyDigits(cpf || "");
    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    const payload = {
      amount: amountCents,
      payment_method: "pix",
      postback_url: postbackUrl,
      customer: {
        name: (name || "").trim(),
        email: (email || "").trim(),
        document: { number: cpfDigits || "00000000000", type: "cpf" },
        phone: formatPhone(phone || ""),
      },
      items: [
        {
          title: itemTitle || "Atestado Médico",
          unit_price: amountCents,
          quantity: 1,
          tangible: false,
        },
      ],
      metadata: { source: "site" },
      pix: { expires_in_days: 1 },
    };

    const fusionRes = await fetch(FUSIONPAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(payload),
    });

    const text = await fusionRes.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      return res.status(502).json({
        error: "Resposta da Fusion Pay não é JSON. Verifique as credenciais e o status da API.",
        _status: fusionRes.status,
      });
    }

    if (!fusionRes.ok) {
      const errList = data?.errors || data?.error;
      const errMsg =
        (Array.isArray(errList) && errList[0]) ||
        data?.message ||
        data?.error ||
        (data?.errors && typeof data.errors === "object" && data.errors.request && data.errors.request[0]) ||
        (data?.errors && typeof data.errors === "object" && Object.values(data.errors).flat()[0]) ||
        "Erro ao criar pagamento. Verifique as credenciais e os dados enviados.";
      return res.status(fusionRes.status).json({
        error: typeof errMsg === "string" ? errMsg : (data?.title || "Erro de validação"),
        details: data,
      });
    }

    const first = data?.data?.[0] ?? data?.data ?? data;
    const transactionId = first?.id ?? data?.id;
    const pixList = first?.pix ?? data?.pix;
    const pixRaw = Array.isArray(pixList) ? pixList[0] : pixList ?? {};
    // Várias formas que a API pode retornar (snake_case, PascalCase, camelCase)
    const qrCode =
      pixRaw.qr_code ?? pixRaw.QrCode ?? pixRaw.qrCode ?? pixRaw.qr_code_base64 ?? pixRaw.QrCodeBase64 ?? null;
    const url = pixRaw.url ?? pixRaw.Url ?? pixRaw.payment_url ?? pixRaw.PaymentUrl ?? null;
    const e2e =
      pixRaw.e2_e ?? pixRaw.E2E ?? pixRaw.e2e ?? pixRaw.qr_code ?? pixRaw.copy_paste ?? pixRaw.copia_cola ?? null;

    const pix = { qr_code: qrCode, url, e2_e: e2e };
    const allNull = !qrCode && !url && !e2e;
    const responseBody = {
      transactionId,
      pix,
      ...(allNull &&
        data && {
          _debug: {
            dataKeys: Object.keys(data || {}),
            firstKeys: first && typeof first === "object" && first !== null ? Object.keys(first) : [],
            pixRawKeys: pixRaw && typeof pixRaw === "object" && pixRaw !== null ? Object.keys(pixRaw) : [],
            raw: data,
          },
        }),
    };
    return res.status(200).json(responseBody);
  } catch (e) {
    const msg = e && e.message ? e.message : "Erro ao criar transação de pagamento";
    return res.status(500).json({ error: msg });
  }
}
