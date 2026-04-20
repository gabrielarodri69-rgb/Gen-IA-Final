'use strict';

require('dotenv').config();

/**
 * Configuração centralizada do BookBot.
 * Todas as variáveis de ambiente são lidas aqui e exportadas como um objeto tipado.
 */
const config = {
  openai: {
    apiKey:      process.env.OPENAI_API_KEY || '',
    model:       process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens:   parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  server: {
    port:    parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  rateLimit: {
    windowMs:    parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '30', 10),
  },

  session: {
    maxMessages: parseInt(process.env.SESSION_MAX_MESSAGES || '20', 10),
    ttlMs:       parseInt(process.env.SESSION_TTL_MS || '1800000', 10), // 30 min
  },
};

// Valida variáveis obrigatórias em produção
if (config.server.nodeEnv === 'production' && !config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY é obrigatória em ambiente de produção.');
}

module.exports = config;
