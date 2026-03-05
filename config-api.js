/**
 * Configuração da API de pagamento (Fusion Pay).
 * O site chama a API no mesmo domínio (ex.: seu site.com.br/api/create-payment).
 * Deixe vazio para usar o próprio domínio onde o site está hospedado.
 */
window.API_BASE_URL = "";

/**
 * Caminho da API de criação de pagamento. Use quando a rota Node (Vercel) não existir
 * e você estiver usando a versão PHP na hospedagem (ex.: /api/create-payment.php).
 * Deixe comentado ou vazio para usar /api/create-payment (padrão).
 */
// window.PAYMENT_API_PATH = "/api/create-payment.php";
