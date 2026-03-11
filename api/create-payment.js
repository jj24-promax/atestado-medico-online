/**
 * Serverless: cria transação PIX na FuriaPay.
 * Chamado pelo formulário do site (mesmo domínio em produção).
 * Env: FURIAPAY_PUBLIC_KEY, FURIAPAY_SECRET_KEY
 */
const FURIAPAY_URL = "https://api.furiapaybr.app/v1/payment-transaction/create";

function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function formatPhone(phone) {
  const digits = onlyDigits(phone || "");
  if (digits.length === 11 && !digits.startsWith("0")) return digits;
  if (digits.length === 10) return digits;
  return onlyDigits(phone || "");
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

  const publicKey = process.env.FURIAPAY_PUBLIC_KEY;
  const secretKey = process.env.FURIAPAY_SECRET_KEY;

  if (!publicKey || !secretKey) {
    return res.status(503).json({
      error: "FuriaPay não configurado. Defina FURIAPAY_PUBLIC_KEY e FURIAPAY_SECRET_KEY nas variáveis de ambiente (Vercel).",
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
    const cpfDigits = onlyDigits(cpf || "") || "00000000000";
    const phoneDigits = formatPhone(phone || "");
    const auth = Buffer.from(`${publicKey}:${secretKey}`).toString("base64");

    const payload = {
      amount: amountCents,
      payment_method: "pix",
      customer: {
        name: (name || "").trim(),
        email: (email || "").trim(),
        document: { type: "cpf", number: cpfDigits },
        phone: phoneDigits,
      },
      items: [
        {
          title: itemTitle || "Atestado Médico",
          unit_price: amountCents,
          quantity: 1,
          tangible: false,
        },
      ],
      shipping: {
        fee: 0,
        address: {
          street: "Av. Paulista",
          street_number: "1000",
          complement: "",
          zip_code: "01310100",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
          country: "BR",
        },
      },
      pix: { expires_in_days: 1 },
      metadata: { provider_name: "Pagamento" },
    };

    const furiaRes = await fetch(FURIAPAY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Basic " + auth,
      },
      body: JSON.stringify(payload),
    });

    const text = await furiaRes.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      return res.status(502).json({
        error: "Resposta da FuriaPay não é JSON. Verifique as credenciais e o status da API.",
        _status: furiaRes.status,
      });
    }

    if (!furiaRes.ok || (furiaRes.status !== 200 && furiaRes.status !== 201)) {
      const errMsg =
        data?.error ?? data?.message ?? "Erro ao gerar cobrança. Verifique as credenciais e os dados enviados.";
      return res.status(furiaRes.status).json({
        error: typeof errMsg === "string" ? errMsg : "Erro de validação",
        detalhes: data,
      });
    }

    const pixCode =
      data?.data?.pix?.qr_code ?? data?.pix?.qr_code ?? null;
    const orderId = data?.data?.id ?? data?.id ?? null;

    if (pixCode) {
      return res.status(200).json({
        pixQrCode: pixCode,
        pixCode: pixCode,
        orderId: orderId,
        transactionId: orderId,
        pix: { qr_code: pixCode, e2_e: pixCode },
      });
    }

    return res.status(502).json({
      error: "FuriaPay não retornou código PIX. Tente novamente.",
      detalhes: data,
    });
  } catch (e) {
    const msg = e && e.message ? e.message : "Erro ao criar transação de pagamento";
    return res.status(500).json({ error: msg });
  }
}
