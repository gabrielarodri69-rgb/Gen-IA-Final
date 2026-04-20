'use strict';

const config = require('../../config');
const logger = require('../utils/logger');

/**
 * SessionStore — armazena o histórico de conversas em memória.
 *
 * Cada sessão contém:
 *   - messages:    array de { role, content } enviados à OpenAI
 *   - createdAt:   timestamp de criação
 *   - lastActivity: timestamp da última mensagem
 *   - isFirstMessage: flag para enviar boas-vindas apenas uma vez
 *
 * Em produção, substitua por Redis ou outro store persistente.
 */
class SessionStore {
  constructor() {
    /** @type {Map<string, Object>} */
    this._store = new Map();
    this._startCleanupInterval();
  }

  /**
   * Obtém ou cria uma sessão para o sessionId fornecido.
   * @param {string} sessionId
   * @returns {Object}
   */
  getOrCreate(sessionId) {
    if (!this._store.has(sessionId)) {
      const session = {
        messages: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        isFirstMessage: true,
      };
      this._store.set(sessionId, session);
      logger.debug(`[SessionStore] Nova sessão criada: ${sessionId}`);
    }
    return this._store.get(sessionId);
  }

  /**
   * Adiciona uma mensagem à sessão e mantém a janela de contexto.
   * @param {string} sessionId
   * @param {'user'|'assistant'} role
   * @param {string} content
   */
  addMessage(sessionId, role, content) {
    const session = this.getOrCreate(sessionId);
    session.messages.push({ role, content });
    session.lastActivity = Date.now();
    session.isFirstMessage = false;

    // Janela deslizante: mantém apenas as N últimas mensagens
    const max = config.session.maxMessages;
    if (session.messages.length > max) {
      session.messages = session.messages.slice(-max);
    }
  }

  /**
   * Retorna o histórico de mensagens de uma sessão.
   * @param {string} sessionId
   * @returns {Array}
   */
  getMessages(sessionId) {
    return this.getOrCreate(sessionId).messages;
  }

  /**
   * Verifica se é a primeira mensagem da sessão.
   * @param {string} sessionId
   * @returns {boolean}
   */
  isFirst(sessionId) {
    return this.getOrCreate(sessionId).isFirstMessage;
  }

  /**
   * Remove todas as mensagens de uma sessão (reset de conversa).
   * @param {string} sessionId
   */
  clearSession(sessionId) {
    if (this._store.has(sessionId)) {
      const session = this._store.get(sessionId);
      session.messages = [];
      session.isFirstMessage = true;
      logger.debug(`[SessionStore] Sessão limpa: ${sessionId}`);
    }
  }

  /**
   * Remove sessões inativas há mais de SESSION_TTL_MS.
   */
  _cleanup() {
    const now = Date.now();
    let removidas = 0;
    for (const [id, session] of this._store.entries()) {
      if (now - session.lastActivity > config.session.ttlMs) {
        this._store.delete(id);
        removidas++;
      }
    }
    if (removidas > 0) {
      logger.debug(`[SessionStore] ${removidas} sessão(ões) expirada(s) removida(s).`);
    }
  }

  _startCleanupInterval() {
    // Executa limpeza a cada 5 minutos
    setInterval(() => this._cleanup(), 5 * 60 * 1000).unref();
  }

  /** Retorna o total de sessões ativas (útil para métricas). */
  get size() {
    return this._store.size;
  }
}

// Singleton compartilhado em toda a aplicação
module.exports = new SessionStore();
