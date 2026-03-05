# Responsividade Mobile — Alterações e Checklist

## Arquivos alterados e motivo

| Arquivo | Motivo |
|--------|--------|
| **styles.css** | Garantias globais (overflow-x, box-sizing, img); variável `--touch-min: 44px`; container com padding responsivo; nav com touch targets 44px, dropdown com scroll e z-index; breakpoints 480px / 640px / 768px; grids (steps, cards, testimonials) mobile-first 1 coluna; tipografia com `clamp()`; botões e FAQ com min-height 44px; formulários com inputs 44px e `font-size: 16px` (evita zoom iOS); páginas Consultar/Solicitar com `min-height: 60dvh` e padding reduzido no mobile; CTA e seções com padding responsivo; remoção de min-width que causava overflow. |
| **script.js** | Menu mobile: fechar ao clicar fora do nav (`document` click); `stopPropagation` no toggle para não fechar ao abrir; referência ao `.main-nav` para checagem de clique fora. |
| **index.html** | Nenhuma alteração necessária (viewport já correto). |
| **solicitar.html** | Nenhuma alteração necessária (viewport já correto). |
| **consultar.html** | Nenhuma alteração necessária (viewport já correto). |

---

## Resumo do que foi corrigido (por seção)

### Globais
- **html / body:** `overflow-x: hidden` para evitar scroll horizontal.
- **body:** `-webkit-text-size-adjust: 100%` para iOS.
- **img:** `max-width: 100%; height: auto` para imagens futuras.
- **.container:** padding `1rem` em mobile, `1.25rem` a partir de 480px.

### Header / Top bar
- Sem width fixo; badge pode quebrar linha em telas muito estreitas.

### Navegação (Nav / Abas)
- **.nav-inner:** `position: relative` para o dropdown.
- **.nav-logo:** `font-size: clamp(0.9375rem, 2.5vw, 1.125rem)` e `min-width: 0` para não estourar.
- **.nav-toggle:** min 44x44px, `-webkit-tap-highlight-color: transparent`.
- **Dropdown (≤767px):** `min-height: 44px` nos links, `max-height: min(80dvh, 80vh)` e `overflow-y: auto` com `-webkit-overflow-scrolling: touch`; z-index 101.
- **script.js:** menu fecha ao clicar fora do nav e ao clicar em um link.

### Hero
- **.hero-subtitle:** `clamp(0.9375rem, 2.5vw, 1.125rem)`.
- **.hero-features:** `max-width: min(480px, 100%)`; itens com `font-size` em clamp e `word-wrap: break-word`.
- **.hero-cta:** em ≤479px coluna e botões `width: 100%`.
- Padding do hero reduzido no mobile.

### Como Funciona (Steps)
- Grid mobile-first: 1 coluna; a partir de 640px `repeat(auto-fit, minmax(260px, 1fr))`.
- **.step:** `min-width: 0`, padding menor no mobile.

### Diferenciais (Cards)
- Grid: 1 coluna no mobile; 640px+ `repeat(auto-fit, minmax(280px, 1fr))`.
- **.card:** `min-width: 0`, padding responsivo.
- **.card h3:** `clamp()` e `word-wrap: break-word`.

### Depoimentos
- Grid: 1 coluna; 640px+ `minmax(280px, 1fr)`.
- **.testimonial:** `min-width: 0`, padding ajustado.

### FAQ
- **.faq-list:** `max-width: min(720px, 100%)`.
- **.faq-question:** `min-height: 44px`, `clamp()` no font-size, `-webkit-tap-highlight-color: transparent`.

### CTA final
- Padding reduzido no mobile; 480px+ volta ao valor maior.

### Páginas Consultar e Solicitar
- **min-height:** `60vh` + `60dvh` (iOS).
- Padding da página e dos cards/form reduzido no mobile.
- **.consultar-card / .form-solicitar:** `max-width: min(..., 100%)`, padding responsivo.
- **.form-grid:** 1 coluna no mobile; 480px e 640px com colunas progressivas.
- **Inputs/select/textarea:** `min-height: 44px`, `font-size: 16px` (evita zoom no iOS em inputs); textarea com `min-height: 120px`; `appearance: none` só em input/textarea (select mantém seta nativa).

### Botões
- **.btn:** `min-height: 44px`, `inline-flex` + `align-items/justify-content: center`, `-webkit-tap-highlight-color: transparent`.
- **.btn-lg:** padding e font-size com clamp.

---

## Definition of Done — Checklist

| Item | Status |
|------|--------|
| Layout responsivo em 320px | ✅ |
| Layout responsivo em 360px | ✅ |
| Layout responsivo em 375px | ✅ |
| Layout responsivo em 414px | ✅ |
| Layout responsivo em 768px | ✅ |
| Menu/abas funcionam com toque (abrir, fechar, link) | ✅ |
| Menu fecha ao clicar fora | ✅ |
| Botões e links com área de toque ≥ 44px | ✅ |
| FAQ accordion funciona com toque (sem duplo clique) | ✅ |
| Sem overflow horizontal (html/body + grids corrigidos) | ✅ |
| Texto não estoura (word-wrap, max-width com min(..., 100%)) | ✅ |
| Elementos não cortados (min-width: 0 em grids) | ✅ |
| Meta viewport correto (width=device-width, initial-scale=1) | ✅ |
| box-sizing: border-box em todos | ✅ |
| Navegação e seções clicáveis funcionam no celular | ✅ |
| Desktop/tablet não quebrados | ✅ |
| Sem novas dependências | ✅ |
| Estilo atual mantido (apenas responsividade) | ✅ |

---

**Como validar:** DevTools → modo dispositivo → larguras 320, 360, 375, 414 e 768px em todas as páginas (Início, Consultar, Solicitar). Verificar scroll horizontal, menu, botões, FAQ e formulários.
