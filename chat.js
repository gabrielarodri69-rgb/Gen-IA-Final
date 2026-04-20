'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { processMessage, resetSession, listarCatalogo } = require('../agent/bookbot');
const { validateChatRequest, sanitize } = require('../utils/validator');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/chat
 *
 * Processa uma mensagem do usuário e retorna a resposta do BookBot.
 *
 * Body:
 *   { "sessionId": "string", "message": "string" }
 *
 * Response:
 *   { "reply": "string", "sessionId": "string", "escalate": boolean, "source": "string" }
 */
router.post('/', async (req, res, next) => {
  const { valid, errors } = validateChatRequest(req.body);
  if (!valid) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const { sessionId } = req.body;
  const message = sanitize(req.body.message);

  try {
    const result = await processMessage(sessionId, message);
    logger.info(`[POST /chat] sessionId=${sessionId} | source=${result.source} | escalate=${result.escalate}`);
    return res.json({ ...result, sessionId });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/chat/session
 *
 * Cria um novo sessionId para iniciar uma conversa.
 *
 * Response:
 *   { "sessionId": "string" }
 */
router.post('/session', (req, res) => {
  const sessionId = uuidv4();
  logger.info(`[POST /chat/session] Nova sessão gerada: ${sessionId}`);
  res.status(201).json({ sessionId });
});

/**
 * DELETE /api/chat/:sessionId
 *
 * Reseta o histórico de conversa de uma sessão.
 */
router.delete('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  resetSession(sessionId);
  res.json({ message: `Sessão ${sessionId} reiniciada com sucesso.` });
});

/**
 * GET /api/chat/catalog
 *
 * Retorna o catálogo de livros em formato de texto (para exibição no chat).
 */
router.get('/catalog', (req, res) => {
  res.json({ catalog: listarCatalogo() });
});

module.exports = router;
