'use strict';

/**
 * Valida e sanitiza os dados de entrada das requisições.
 */

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Valida o corpo da requisição POST /chat.
 * @param {Object} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateChatRequest(body) {
  const errors = [];

  if (!body.message || typeof body.message !== 'string') {
    errors.push('"message" é obrigatório e deve ser uma string.');
  } else if (body.message.trim().length === 0) {
    errors.push('"message" não pode ser vazia.');
  } else if (body.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`"message" não pode ter mais de ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('"sessionId" é obrigatório e deve ser uma string.');
  } else if (!/^[\w-]{8,64}$/.test(body.sessionId)) {
    errors.push('"sessionId" deve ter entre 8 e 64 caracteres alfanuméricos ou hífens.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Remove caracteres potencialmente perigosos da mensagem do usuário.
 * @param {string} text
 * @returns {string}
 */
function sanitize(text) {
  return text.replace(/[<>]/g, '').trim();
}

module.exports = { validateChatRequest, sanitize };
