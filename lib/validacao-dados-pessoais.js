/**
 * Validação e máscaras para o formulário de Dados Pessoais.
 * Uso: script.js da página solicitar.html (e consultar se necessário).
 */

(function (global) {
  'use strict';

  // ---- Validação: Nome completo (obrigatório, mínimo 2 palavras, apenas letras e espaços) ----
  function validarNomeCompleto(valor) {
    if (!valor || typeof valor !== 'string') return { valido: false, mensagem: 'Nome completo é obrigatório.' };
    var trimmed = valor.trim();
    if (trimmed.length === 0) return { valido: false, mensagem: 'Nome completo é obrigatório.' };
    // Apenas letras (incluindo acentuação) e espaços; mínimo 2 palavras
    if (!/^[\p{L}\s]+$/u.test(trimmed)) {
      return { valido: false, mensagem: 'Use apenas letras no nome (nome e sobrenome).' };
    }
    var partes = trimmed.split(/\s+/).filter(Boolean);
    if (partes.length < 2) {
      return { valido: false, mensagem: 'Informe pelo menos nome e sobrenome.' };
    }
    return { valido: true, mensagem: '' };
  }

  // ---- Validação: CPF (formato 000.000.000-00 + dígitos verificadores) ----
  function validarCPF(valor) {
    if (!valor || typeof valor !== 'string') return { valido: false, mensagem: 'CPF é obrigatório.' };
    var numeros = valor.replace(/\D/g, '');
    if (numeros.length !== 11) {
      return { valido: false, mensagem: 'CPF deve ter 11 dígitos (formato: 000.000.000-00).' };
    }
    // Rejeita CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(numeros)) {
      return { valido: false, mensagem: 'CPF inválido.' };
    }
    // Cálculo do primeiro dígito verificador
    var soma = 0;
    for (var i = 0; i < 9; i++) soma += parseInt(numeros[i], 10) * (10 - i);
    var resto = (soma * 10) % 11;
    var digito1 = resto === 10 ? 0 : resto;
    if (digito1 !== parseInt(numeros[9], 10)) {
      return { valido: false, mensagem: 'CPF inválido (dígitos verificadores incorretos).' };
    }
    // Cálculo do segundo dígito verificador
    soma = 0;
    for (var j = 0; j < 10; j++) soma += parseInt(numeros[j], 10) * (11 - j);
    resto = (soma * 10) % 11;
    var digito2 = resto === 10 ? 0 : resto;
    if (digito2 !== parseInt(numeros[10], 10)) {
      return { valido: false, mensagem: 'CPF inválido (dígitos verificadores incorretos).' };
    }
    return { valido: true, mensagem: '' };
  }

  // ---- Validação: E-mail (obrigatório, formato válido) ----
  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validarEmail(valor) {
    if (!valor || typeof valor !== 'string') return { valido: false, mensagem: 'E-mail é obrigatório.' };
    var trimmed = valor.trim();
    if (trimmed.length === 0) return { valido: false, mensagem: 'E-mail é obrigatório.' };
    if (!REGEX_EMAIL.test(trimmed)) {
      return { valido: false, mensagem: 'Informe um e-mail válido.' };
    }
    return { valido: true, mensagem: '' };
  }

  // ---- Validação: Telefone (obrigatório, DDD + 9 dígitos para celular: (XX) 9XXXX-XXXX) ----
  function validarTelefone(valor) {
    if (!valor || typeof valor !== 'string') return { valido: false, mensagem: 'Telefone é obrigatório.' };
    var numeros = valor.replace(/\D/g, '');
    if (numeros.length !== 11) {
      return { valido: false, mensagem: 'Telefone deve ter DDD + 9 dígitos (celular: (XX) 9XXXX-XXXX).' };
    }
    // DDD válido (11-99) e celular começa com 9
    var ddd = parseInt(numeros.substring(0, 2), 10);
    var nono = numeros[2];
    if (ddd < 11 || ddd > 99) {
      return { valido: false, mensagem: 'DDD inválido.' };
    }
    if (nono !== '9') {
      return { valido: false, mensagem: 'Para celular/WhatsApp use número que comece com 9 após o DDD.' };
    }
    return { valido: true, mensagem: '' };
  }

  // ---- Máscara CPF: formata enquanto digita (000.000.000-00) ----
  function mascaraCPF(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '');
      if (v.length <= 11) {
        this.value = v
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
    });
  }

  // ---- Máscara Telefone: (XX) 9XXXX-XXXX ----
  function mascaraTelefone(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '');
      if (v.length <= 11) {
        this.value = v
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');
      }
    });
  }

  // ---- Validação: Data de início do afastamento (DD/MM/AAAA, obrigatório, data real, não futura) ----
  function validarDataInicioAfastamento(valor) {
    if (!valor || typeof valor !== 'string') return { valido: false, mensagem: 'Data de início do afastamento é obrigatória.' };
    var numeros = valor.replace(/\D/g, '');
    if (numeros.length !== 8) {
      return { valido: false, mensagem: 'Informe a data no formato DD/MM/AAAA.' };
    }
    var dia = parseInt(numeros.substring(0, 2), 10);
    var mes = parseInt(numeros.substring(2, 4), 10);
    var ano = parseInt(numeros.substring(4, 8), 10);
    if (mes < 1 || mes > 12) {
      return { valido: false, mensagem: 'Mês deve ser entre 01 e 12.' };
    }
    var diasNoMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)) diasNoMes[1] = 29;
    if (dia < 1 || dia > diasNoMes[mes - 1]) {
      return { valido: false, mensagem: 'Data inválida para o mês informado.' };
    }
    if (ano < 2020 || ano > 2030) {
      return { valido: false, mensagem: 'Ano deve estar entre 2020 e 2030.' };
    }
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var dataInicio = new Date(ano, mes - 1, dia);
    if (dataInicio > hoje) {
      return { valido: false, mensagem: 'A data não pode ser futura.' };
    }
    return { valido: true, mensagem: '' };
  }

  // ---- Máscara Data: DD/MM/AAAA (8 dígitos) ----
  function mascaraDataDDMMAAAA(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '');
      if (v.length <= 8) {
        this.value = v
          .replace(/(\d{2})(\d)/, '$1/$2')
          .replace(/(\d{2})(\d)/, '$1/$2');
      }
    });
  }

  /**
   * Converte DD/MM/AAAA para AAAA-MM-DD (para envio ao backend ou input type="date").
   */
  function dataDDMMAAAAParaISO(valor) {
    var numeros = (valor || '').replace(/\D/g, '');
    if (numeros.length !== 8) return '';
    var dia = numeros.substring(0, 2);
    var mes = numeros.substring(2, 4);
    var ano = numeros.substring(4, 8);
    return ano + '-' + mes + '-' + dia;
  }

  // ---- Expor API ----
  global.ValidacaoDadosPessoais = {
    validarNomeCompleto: validarNomeCompleto,
    validarCPF: validarCPF,
    validarEmail: validarEmail,
    validarTelefone: validarTelefone,
    validarDataInicioAfastamento: validarDataInicioAfastamento,
    mascaraCPF: mascaraCPF,
    mascaraTelefone: mascaraTelefone,
    mascaraDataDDMMAAAA: mascaraDataDDMMAAAA,
    dataDDMMAAAAParaISO: dataDDMMAAAAParaISO
  };
})(typeof window !== 'undefined' ? window : this);
