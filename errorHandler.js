'use strict';

const logger = require('../utils/logger');

/**
 * Middleware global de tratamento de erros do Express.
 * Deve ser registrado como o último middleware da aplicação.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(`[ErrorHandler] ${err.message}`, { stack: err.stack, path: req.path });

  // Erro de autenticação OpenAI
  if (err.status === 401 || err.message?.includes('API key')) {
    return res.status(500).json({
      error: 'Erro de configuração do serviço de IA. Contate o suporte.',
    });
  }

  // Limite de rate da OpenAI
  if (err.status === 429) {
    return res.status(503).json({
      error: 'Serviço temporariamente sobrecarregado. Tente novamente em instantes.',
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Ocorreu um erro interno. Tente novamente.',
  });
}

module.exports = errorHandler;
