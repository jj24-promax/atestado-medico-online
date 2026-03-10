// Menu mobile (abas): toggle, fechar ao clicar em link ou fora do nav
var nav = document.querySelector('.main-nav');
var navToggle = document.querySelector('.nav-toggle');
var navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks && nav) {
  navToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    navLinks.classList.toggle('is-open');
  });
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('is-open');
    });
  });
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('is-open') && !nav.contains(e.target)) {
      navLinks.classList.remove('is-open');
    }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = item.hasAttribute('data-open');

    document.querySelectorAll('.faq-item').forEach((other) => {
      other.removeAttribute('data-open');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      const otherAnswer = other.querySelector('.faq-answer');
      if (otherAnswer) otherAnswer.style.maxHeight = '';
    });

    if (!isOpen) {
      item.setAttribute('data-open', '');
      question.setAttribute('aria-expanded', 'true');
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    } else if (answer) {
      answer.style.maxHeight = '';
    }
  });
});

// Máscara CPF na página Consultar (preparado para API depois)
var cpfConsultar = document.getElementById('cpf-consultar');
if (cpfConsultar) {
  cpfConsultar.addEventListener('input', function () {
    var v = this.value.replace(/\D/g, '');
    if (v.length <= 11) {
      this.value = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
  });
}

// Consultar: validação CPF e popup (sucesso ou erro)
var formConsultar = document.getElementById('form-consultar');
var modalConsultar = document.getElementById('consultar-modal');
var modalTitle = document.getElementById('consultar-modal-title');
var modalMessage = document.getElementById('consultar-modal-message');
var modalCloseBtn = document.getElementById('consultar-modal-close');
var modalBox = modalConsultar ? modalConsultar.querySelector('.consultar-modal-box') : null;

function openConsultarModal(titulo, mensagem, tipo) {
  if (!modalConsultar || !modalTitle || !modalMessage || !modalBox) return;
  modalTitle.textContent = titulo;
  modalMessage.textContent = mensagem;
  modalBox.classList.remove('consultar-modal--sucesso', 'consultar-modal--erro');
  if (tipo === 'erro') modalBox.classList.add('consultar-modal--erro');
  else modalBox.classList.add('consultar-modal--sucesso');
  modalConsultar.removeAttribute('hidden');
  if (modalCloseBtn) modalCloseBtn.focus();
}

function closeConsultarModal() {
  if (modalConsultar) modalConsultar.setAttribute('hidden', '');
}

if (formConsultar && typeof ValidacaoDadosPessoais !== 'undefined') {
  formConsultar.addEventListener('submit', function (e) {
    e.preventDefault();
    var cpfVal = (document.getElementById('cpf-consultar') && document.getElementById('cpf-consultar').value) || '';
    var resultado = ValidacaoDadosPessoais.validarCPF(cpfVal);
    if (resultado.valido) {
      openConsultarModal('Envio em andamento', 'Aguarde seu atestado vai ser enviado via e-mail e WhatsApp.', 'sucesso');
    } else {
      openConsultarModal('CPF inválido', 'Coloque o CPF de maneira correta.', 'erro');
    }
  });
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeConsultarModal);
  }
  if (modalConsultar) {
    modalConsultar.addEventListener('click', function (ev) {
      if (ev.target === modalConsultar) closeConsultarModal();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && modalConsultar && !modalConsultar.hasAttribute('hidden')) {
        closeConsultarModal();
      }
    });
  }
}

// Scroll infinito dos depoimentos com autoplay, loop e suporte a drag/touch
var testimonialsScroll = document.getElementById('testimonials-scroll');
var testimonialsTrack = document.getElementById('testimonials-track');
if (testimonialsScroll && testimonialsTrack) {
  var halfWidth = 0;
  var autoScrollId = null;
  var autoScrollSpeed = window.innerWidth < 768 ? 0.35 : 0.5;
  var isPaused = false;
  var isDragging = false;
  var startX = 0;
  var startScrollLeft = 0;
  var resumeTimer = null;

  function refreshTestimonialsMetrics() {
    halfWidth = testimonialsTrack.scrollWidth / 2;
    autoScrollSpeed = window.innerWidth < 768 ? 0.35 : 0.5;
    if (halfWidth > 0 && testimonialsScroll.scrollLeft <= 0) {
      testimonialsScroll.scrollLeft = 1;
    }
  }

  function normalizeTestimonialsLoop() {
    if (!halfWidth) return;
    if (testimonialsScroll.scrollLeft >= halfWidth) {
      testimonialsScroll.scrollLeft -= halfWidth;
    } else if (testimonialsScroll.scrollLeft <= 0) {
      testimonialsScroll.scrollLeft += halfWidth;
    }
  }

  function pauseTestimonials(ms) {
    isPaused = true;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      isPaused = false;
    }, ms || 1600);
  }

  function autoplayTestimonials() {
    if (!isPaused && !isDragging && halfWidth) {
      testimonialsScroll.scrollLeft += autoScrollSpeed;
      normalizeTestimonialsLoop();
    }
    autoScrollId = window.requestAnimationFrame(autoplayTestimonials);
  }

  refreshTestimonialsMetrics();
  testimonialsScroll.addEventListener('scroll', normalizeTestimonialsLoop, { passive: true });
  window.addEventListener('resize', refreshTestimonialsMetrics);

  testimonialsScroll.addEventListener('mouseenter', function () {
    isPaused = true;
  });
  testimonialsScroll.addEventListener('mouseleave', function () {
    isPaused = false;
  });
  testimonialsScroll.addEventListener('wheel', function () {
    pauseTestimonials(1800);
  }, { passive: true });
  testimonialsScroll.addEventListener('touchstart', function () {
    pauseTestimonials(2500);
  }, { passive: true });
  testimonialsScroll.addEventListener('touchend', function () {
    pauseTestimonials(1800);
  }, { passive: true });

  testimonialsScroll.addEventListener('pointerdown', function (e) {
    isDragging = true;
    isPaused = true;
    startX = e.clientX;
    startScrollLeft = testimonialsScroll.scrollLeft;
    testimonialsScroll.classList.add('is-dragging');
  });

  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    var deltaX = e.clientX - startX;
    testimonialsScroll.scrollLeft = startScrollLeft - deltaX;
    normalizeTestimonialsLoop();
  });

  function stopDraggingTestimonials() {
    if (!isDragging) return;
    isDragging = false;
    testimonialsScroll.classList.remove('is-dragging');
    pauseTestimonials(1800);
  }

  window.addEventListener('pointerup', stopDraggingTestimonials);
  window.addEventListener('pointercancel', stopDraggingTestimonials);

  autoScrollId = window.requestAnimationFrame(autoplayTestimonials);
}

// Precificação dinâmica na página Solicitar (por dias de afastamento)
var diasSelect = document.getElementById('dias');
var valorAPagarEl = document.getElementById('valor-a-pagar');
var btnPagamento = document.getElementById('btn-pagamento');
var amountInput = document.getElementById('amount');

var PRICE_BY_DAYS = {
  '1': 27.9,
  '2': 37.9,
  '3': 47.9,
  '4': 57.9,
  '5': 67.9,
  '6': 77.9,
  '7': 87.9,
  'mais': 117.9
};

function formatPrice(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function updatePrice() {
  if (!diasSelect || !valorAPagarEl || !btnPagamento || !amountInput) return;
  var value = diasSelect.value;
  var price = value && PRICE_BY_DAYS[value] !== undefined ? PRICE_BY_DAYS[value] : 27.9;
  var text = formatPrice(price);
  valorAPagarEl.textContent = text;
  btnPagamento.textContent = 'Continuar para pagamento · ' + text;
  amountInput.value = String(price);
}

if (diasSelect) {
  diasSelect.addEventListener('change', updatePrice);
  updatePrice();
}

// ---- Prévia do Atestado (atualização em tempo real a partir do formulário) ----
function numeroPorExtenso(numero) {
  var n = String(numero).trim();
  var porExtenso = { '1': 'um', '2': 'dois', '3': 'três', '4': 'quatro', '5': 'cinco', '6': 'seis', '7': 'sete' };
  if (porExtenso[n]) return n + ' (' + porExtenso[n] + ')';
  return n ? n + ' (' + n + ')' : null;
}

function updateAtestadoPreview() {
  var nomeEl = document.getElementById('nome');
  var cpfEl = document.getElementById('cpf');
  var diasEl = document.getElementById('dias');
  var dataInicioEl = document.getElementById('data-inicio');
  var previewNome = document.getElementById('preview-nome');
  var previewCpf = document.getElementById('preview-cpf');
  var previewHora = document.getElementById('preview-hora');
  var previewDias = document.getElementById('preview-dias');
  var previewDataLocal = document.getElementById('preview-data-local');

  if (!previewNome || !previewCpf || !previewHora || !previewDias || !previewDataLocal) return;

  previewNome.textContent = (nomeEl && nomeEl.value.trim()) ? nomeEl.value.trim() : 'NOME DO PACIENTE';
  previewCpf.textContent = (cpfEl && cpfEl.value) ? cpfEl.value : '000.000.000-00';

  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  previewHora.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;

  if (diasEl && diasEl.value) {
    var val = diasEl.value;
    if (val === 'mais') {
      previewDias.textContent = 'a critério médico';
    } else {
      var formatado = numeroPorExtenso(val);
      previewDias.textContent = formatado || val;
    }
  } else {
    previewDias.textContent = 'X (um)';
  }

  var dataStr = (dataInicioEl && dataInicioEl.value) ? dataInicioEl.value.trim() : '';
  previewDataLocal.textContent = dataStr ? 'São Paulo, ' + dataStr : 'São Paulo, DD/MM/AAAA';
}

var formSolicitarForPreview = document.getElementById('form-solicitar');
if (formSolicitarForPreview) {
  ['nome', 'cpf', 'dias', 'data-inicio'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateAtestadoPreview);
      el.addEventListener('change', updateAtestadoPreview);
    }
  });
  updateAtestadoPreview();
}

// Links âncora suave (inclui #parceiros e demais âncoras; mesmo quando href é index.html#parceiros)
function setupSmoothAnchor(anchor) {
  anchor.addEventListener('click', function (e) {
    var href = this.getAttribute('href') || '';
    if (href === '#') return;
    var hash = '';
    if (href.indexOf('#') !== -1) {
      hash = href.split('#')[1];
    } else {
      return;
    }
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;
    var path = href.split('#')[0].replace(/^\//, '').trim();
    var currentPath = (window.location.pathname || '').replace(/^\//, '') || 'index.html';
    var isSamePage = !path || path === 'index.html' || path === currentPath;
    if (isSamePage) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
document.querySelectorAll('a[href^="#"]').forEach(setupSmoothAnchor);
document.querySelectorAll('a[href*="#"]').forEach(function (a) {
  var h = a.getAttribute('href') || '';
  if (h.indexOf('#') === 0 || h.indexOf('#') === -1) return;
  setupSmoothAnchor(a);
});

// ---- Formulário Solicitar: máscaras e validação de Dados Pessoais ----
var formSolicitar = document.getElementById('form-solicitar');
if (formSolicitar && typeof ValidacaoDadosPessoais !== 'undefined') {
  var V = ValidacaoDadosPessoais;

  // Máscaras: CPF e Telefone (formato enquanto digita)
  var cpfSolicitar = document.getElementById('cpf');
  var telSolicitar = document.getElementById('telefone');
  var dataInicioSolicitar = document.getElementById('data-inicio');
  if (cpfSolicitar) V.mascaraCPF(cpfSolicitar);
  if (telSolicitar) V.mascaraTelefone(telSolicitar);
  if (dataInicioSolicitar) V.mascaraDataDDMMAAAA(dataInicioSolicitar);

  function showErro(campoId, mensagem) {
    var el = document.getElementById(campoId + '-erro');
    var input = document.getElementById(campoId);
    if (el) {
      el.textContent = mensagem || '';
      el.style.display = mensagem ? 'block' : 'none';
    }
    if (input) {
      if (mensagem) input.classList.add('invalid'); else input.classList.remove('invalid');
      input.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    }
  }

  function validarCampo(campoId, valor, validarFn) {
    var r = validarFn(valor);
    showErro(campoId, r.mensagem);
    return r.valido;
  }

  var apiBase = window.location.origin;
  if (window.location.hostname === 'localhost' && typeof window !== 'undefined' && window.API_BASE_URL) {
    var custom = String(window.API_BASE_URL).trim();
    if (custom) apiBase = custom;
  }
  var paymentPath = (typeof window.PAYMENT_API_PATH !== 'undefined' && window.PAYMENT_API_PATH) ? window.PAYMENT_API_PATH : '/api/create-payment';
  var paymentCreateUrl = apiBase.replace(/\/$/, '') + paymentPath;

  formSolicitar.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = document.getElementById('nome');
    var cpf = document.getElementById('cpf');
    var email = document.getElementById('email');
    var telefone = document.getElementById('telefone');
    var dataInicio = document.getElementById('data-inicio');

    var okNome = validarCampo('nome', nome ? nome.value.trim() : '', V.validarNomeCompleto);
    var okCpf = validarCampo('cpf', cpf ? cpf.value : '', V.validarCPF);
    var okEmail = validarCampo('email', email ? email.value.trim() : '', V.validarEmail);
    var okTelefone = validarCampo('telefone', telefone ? telefone.value : '', V.validarTelefone);
    var okDataInicio = validarCampo('data-inicio', dataInicio ? dataInicio.value : '', V.validarDataInicioAfastamento);

    if (!okNome || !okCpf || !okEmail || !okTelefone || !okDataInicio) {
      var primeiro = !okNome ? nome : !okCpf ? cpf : !okEmail ? email : !okTelefone ? telefone : dataInicio;
      if (primeiro) primeiro.focus();
      return;
    }

    var amountEl = document.getElementById('amount');
    var diasEl = document.getElementById('dias');
    var sintomasEl = document.getElementById('sintomas');
    var amountNum = parseFloat(amountEl ? amountEl.value : '27.9') || 27.9;
    var paymentPayload = {
      amount: amountNum,
      name: nome ? nome.value.trim() : '',
      email: email ? email.value.trim() : '',
      cpf: (cpf ? cpf.value : '').replace(/\D/g, ''),
      phone: telefone ? telefone.value : '',
      itemTitle: 'Atestado Médico'
    };

    var btn = formSolicitar.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    }

    fetch(paymentCreateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    })
      .then(function (payRes) {
        return payRes.text().then(function (text) {
          var payData = null;
          try {
            payData = text ? JSON.parse(text) : null;
          } catch (e) {
            if (payRes.status === 404) {
              return { showPix: false, error: 'A rota de pagamento não foi encontrada (404). Confira se o deploy na Vercel inclui a pasta "api" e se o domínio está correto (www.atestadomed.com.br).' };
            }
            return { showPix: false, error: 'A API retornou uma resposta inválida. Verifique se o projeto está deployado com a pasta api/ e as variáveis FUSIONPAY na Vercel.' };
          }
          if (payRes.ok && payData) {
            var url = payData.pix && payData.pix.url ? payData.pix.url : (payData.checkout_url || payData.url);
            if (url) return { redirect: true, url: url };
            var pix = payData.pix;
            if (!pix && (payData.pixCode || payData.pixQrCode)) {
              var code = payData.pixCode || payData.pixQrCode;
              pix = { qr_code: payData.pixQrCode || code, e2_e: payData.pixCode || code };
              if (payData.orderId) payData.transactionId = payData.orderId;
            }
            if (pix && (pix.qr_code || pix.e2_e)) return { showPix: true, pix: pix };
          }
          var msg = (payData && payData.error) ? payData.error : 'Pagamento não disponível. Configure na Vercel: FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY e APP_URL.';
          return { showPix: false, error: msg };
        });
      })
      .catch(function (err) {
        return { showPix: false, error: (err && err.message) ? err.message : 'Não foi possível conectar à API. Verifique sua conexão e se o site está em www.atestadomed.com.br.' };
      })
      .then(function (result) {
        if (result.redirect && result.url) {
          window.location.href = result.url;
          return;
        }
        if (result.showPix && result.pix) {
          var backdrop = document.getElementById('pix-modal-backdrop');
          var qrImg = document.getElementById('pix-qr-image');
          var qrCanvas = document.getElementById('pix-qr-canvas');
          var copyInput = document.getElementById('pix-copia-cola');
          var copyBtn = document.getElementById('pix-copy-btn');
          var btnPag = document.getElementById('btn-pagamento');
          var qrVal = result.pix.qr_code;
          var e2eVal = result.pix.e2_e;
          var isImage = qrVal && (qrVal.indexOf('data:image') === 0 || qrVal.indexOf('http://') === 0 || qrVal.indexOf('https://') === 0);
          var pixString = e2eVal || (!isImage && qrVal ? qrVal : null);
          if (copyInput) copyInput.value = e2eVal || qrVal || '';
          if (backdrop) {
            if (isImage && qrImg) {
              qrImg.src = qrVal;
              qrImg.removeAttribute('hidden');
              if (qrCanvas) { qrCanvas.innerHTML = ''; qrCanvas.style.display = 'none'; }
            } else if (pixString && qrCanvas) {
              qrCanvas.innerHTML = '';
              qrCanvas.style.display = 'flex';
              if (typeof QRCode !== 'undefined') {
                try {
                  new QRCode(qrCanvas, pixString);
                } catch (e1) {
                  try {
                    new QRCode(qrCanvas, { text: pixString, width: 200, height: 200 });
                  } catch (e2) {
                    qrCanvas.style.display = 'none';
                  }
                }
              } else {
                qrCanvas.style.display = 'none';
              }
              if (qrImg) qrImg.setAttribute('hidden', '');
            } else {
              if (qrImg) qrImg.setAttribute('hidden', '');
              if (qrCanvas) { qrCanvas.innerHTML = ''; qrCanvas.style.display = 'none'; }
            }
            backdrop.removeAttribute('hidden');
            backdrop.setAttribute('aria-hidden', 'false');
            backdrop.style.display = 'flex';
            if (btnPag) btnPag.style.display = 'none';
            document.body.style.overflow = 'hidden';
          }
          var closeModal = function () {
            if (backdrop) {
              backdrop.setAttribute('hidden', '');
              backdrop.setAttribute('aria-hidden', 'true');
            }
            if (btnPag) btnPag.style.display = '';
            document.body.style.overflow = '';
          };
          var closeBtn = document.getElementById('pix-modal-close');
          if (closeBtn) closeBtn.onclick = closeModal;
          if (backdrop) {
            backdrop.onclick = function (e) {
              if (e.target === backdrop) closeModal();
            };
          }
          var escHandler = function (e) {
            if (e.key === 'Escape' && backdrop && !backdrop.hasAttribute('hidden')) {
              closeModal();
              document.removeEventListener('keydown', escHandler);
            }
          };
          document.addEventListener('keydown', escHandler);
          if (copyBtn && copyInput) {
            copyBtn.onclick = function () {
              var text = copyInput.value;
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                  copyBtn.textContent = 'Copiado!';
                  setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 2000);
                });
              } else {
                copyInput.select();
                try {
                  document.execCommand('copy');
                  copyBtn.textContent = 'Copiado!';
                  setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 2000);
                } catch (e) {
                  copyBtn.textContent = 'Copiar';
                }
              }
            };
          }
          return;
        }
        var aviso = document.getElementById('solicitar-pagamento-aviso');
        if (aviso) {
          var p = aviso.querySelector('p');
          if (p) {
            var msg = (result && result.error) ? result.error : 'Configure na Vercel (Settings → Environment Variables): FUSIONPAY_PUBLIC_KEY, FUSIONPAY_SECRET_KEY e APP_URL. Depois faça um novo deploy.';
            p.textContent = msg;
          }
          aviso.removeAttribute('hidden');
          aviso.setAttribute('aria-live', 'polite');
        }
      })
      .catch(function (err) {
        var aviso = document.getElementById('solicitar-pagamento-aviso');
        if (aviso) {
          var p = aviso.querySelector('p');
          if (p) p.textContent = (err && err.message) ? err.message : 'Não foi possível conectar ao pagamento. Tente novamente.';
          aviso.removeAttribute('hidden');
        } else {
          alert(err && err.message ? err.message : 'Não foi possível conectar ao pagamento. Tente novamente.');
        }
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          if (typeof formatPrice === 'function' && amountEl) {
            var p = parseFloat(amountEl.value) || 27.9;
            btn.textContent = 'Continuar para pagamento · ' + formatPrice(p);
          } else {
            btn.textContent = 'Continuar para pagamento · R$ 27,90';
          }
        }
      });
  });

  // Validação ao sair do campo (blur) para feedback imediato
  ['nome', 'cpf', 'email', 'telefone', 'data-inicio'].forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', function () {
      var v = this.value.trim();
      if (id === 'cpf' || id === 'telefone' || id === 'data-inicio') v = this.value;
      if (v.length === 0) { showErro(id, ''); return; }
      var fn = id === 'nome' ? V.validarNomeCompleto : id === 'cpf' ? V.validarCPF : id === 'email' ? V.validarEmail : id === 'telefone' ? V.validarTelefone : V.validarDataInicioAfastamento;
      validarCampo(id, v, fn);
    });
  });
}

// ---- Floating Widget: médicos online (simulação por horário + atualização orgânica) ----
(function () {
  var widget = document.getElementById('floating-medicos-widget');
  var countEl = document.getElementById('floating-medicos-count');
  if (!widget || !countEl) return;

  function getRangeForHour() {
    var h = new Date().getHours();
    if (h >= 8 && h < 18) return { min: 12, max: 25 };
    if (h >= 18 && h < 23) return { min: 8, max: 15 };
    return { min: 3, max: 7 };
  }

  function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  var range = getRangeForHour();
  var current = randomInRange(range.min, range.max);
  countEl.textContent = current;

  function tick() {
    range = getRangeForHour();
    var delta = Math.random() < 0.5 ? -1 : 1;
    current = clamp(current + delta, range.min, range.max);
    if (current < 1) current = 1;
    countEl.textContent = current;
  }

  var intervalMs = 30000 + Math.floor(Math.random() * 30000);
  setInterval(tick, intervalMs);

  window.setTimeout(function () {
    widget.classList.add('is-visible');
  }, 3000);
})();
