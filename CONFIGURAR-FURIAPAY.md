# Configurar FuriaPay na Vercel

O `api/create-payment.js` foi alterado para usar a **FuriaPay** em vez da Fusion Pay.

## Variáveis de ambiente

No **Vercel** → seu projeto → **Settings** → **Environment Variables**, adicione:

| Nome | Valor | Observação |
|------|--------|------------|
| `FURIAPAY_PUBLIC_KEY` | Sua chave pública (ex: `furiapay_live_...`) | Obrigatório |
| `FURIAPAY_SECRET_KEY` | Sua chave secreta (ex: `sk_live_...`) | Obrigatório |

Use as mesmas chaves que você tinha no script PHP. **Não** commite essas chaves no Git.

Depois de salvar, faça um **novo deploy** (Deployments → Redeploy ou push no repositório) para as variáveis valerem.

## Teste

1. Acesse a página **Solicitar Atestado** no site.
2. Preencha o formulário e clique em **Continuar para pagamento**.
3. Deve abrir o modal com o QR Code PIX e o código copia e cola da FuriaPay.

Se aparecer erro "FuriaPay não configurado", confira se as duas variáveis estão definidas na Vercel e se fez redeploy.
