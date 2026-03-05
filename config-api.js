/**
 * Configuração da API de leads (compartilhada entre o site e o dashboard).
 *
 * Uma única API atende:
 * - Site estático (solicitar.html): envia POST com novos leads
 * - Dashboard (Next.js): faz GET para listar e exibir os leads
 *
 * Em desenvolvimento: dashboard em http://localhost:3000
 * Em produção: use a URL do seu dashboard (ex.: https://seu-dashboard.vercel.app)
 */
window.API_BASE_URL = "http://localhost:3000";
window.API_LEADS_URL = window.API_BASE_URL + "/api/leads";
