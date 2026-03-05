<?php
/**
 * API PHP para criar pagamento PIX (Fusion Pay).
 * Use na hospedagem que suporta PHP se a Vercel não publicar a rota /api/create-payment.
 * Configure $publicKey e $secretKey abaixo (ou use variáveis de ambiente se disponível).
 * URL: POST /api/create-payment.php (ou o caminho onde subir este arquivo)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Chaves: use variáveis de ambiente ou defina aqui (não commite com chaves preenchidas)
$publicKey = getenv('FUSIONPAY_PUBLIC_KEY') ?: ''; // ou ex.: 'sua_public_key'
$secretKey = getenv('FUSIONPAY_SECRET_KEY') ?: ''; // ou ex.: 'sua_secret_key'

if (empty($publicKey) || empty($secretKey)) {
    http_response_code(503);
    echo json_encode([
        'error' => 'Fusion Pay não configurado. Defina FUSIONPAY_PUBLIC_KEY e FUSIONPAY_SECRET_KEY.'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$amount = isset($input['amount']) ? (float) $input['amount'] : 0;
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$cpf = preg_replace('/\D/', '', $input['cpf'] ?? '');
$phone = $input['phone'] ?? '';
$itemTitle = trim($input['itemTitle'] ?? 'Atestado Médico');

if (!$amount || !$name || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos obrigatórios: amount, name, email.']);
    exit;
}

$valorCentavos = (int) round($amount * 100);
$cpf = $cpf ?: '00000000000';

// Telefone: +55 se não começar com +
if ($phone !== '' && $phone[0] !== '+') {
    $digits = preg_replace('/\D/', '', $phone);
    if (strlen($digits) === 11 && $digits[0] !== '0') {
        $phone = '+55' . $digits;
    } elseif (strlen($digits) === 10) {
        $phone = '+55' . $digits;
    } else {
        $phone = '+55' . $digits;
    }
}

$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '');
$postbackUrl = rtrim($baseUrl, '/') . '/api/webhooks/fusionpay.php';

$url = 'https://api.fusionpay.com.br/v1/payment-transaction/create';
$dados = [
    'amount' => $valorCentavos,
    'payment_method' => 'pix',
    'postback_url' => $postbackUrl,
    'customer' => [
        'name' => $name,
        'email' => $email,
        'document' => ['number' => $cpf, 'type' => 'cpf'],
        'phone' => $phone ?: '+5511999999999'
    ],
    'items' => [
        [
            'title' => $itemTitle,
            'unit_price' => $valorCentavos,
            'quantity' => 1,
            'tangible' => false
        ]
    ],
    'metadata' => ['source' => 'site'],
    'pix' => ['expires_in_days' => 1]
];

$auth = base64_encode($publicKey . ':' . $secretKey);
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($dados),
    CURLOPT_HTTPHEADER => [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

$resposta = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($resposta, true) ?: [];

if ($httpCode >= 200 && $httpCode < 300) {
    $first = $data['data'][0] ?? $data;
    $transactionId = $first['id'] ?? $data['id'] ?? null;
    $pixList = $first['pix'] ?? $data['pix'] ?? [];
    $pix = is_array($pixList) ? ($pixList[0] ?? []) : $pixList;

    echo json_encode([
        'transactionId' => $transactionId,
        'pix' => [
            'qr_code' => $pix['qr_code'] ?? null,
            'url' => $pix['url'] ?? null,
            'e2_e' => $pix['e2_e'] ?? null
        ]
    ]);
} else {
    $msg = $data['message'] ?? $data['error'] ?? 'Erro ao criar pagamento.';
    http_response_code($httpCode >= 400 ? $httpCode : 500);
    echo json_encode(['error' => $msg, 'details' => $data]);
}
