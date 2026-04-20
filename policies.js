'use strict';

/**
 * Políticas e FAQ da PageStore.
 * Centraliza todas as regras de negócio que o BookBot deve conhecer.
 */

const POLICIES = {
  frete: {
    freteGratisMinimo: 99.00,
    prazoCapital:  { min: 3, max: 7,  unidade: 'dias úteis' },
    prazoInterior: { min: 5, max: 12, unidade: 'dias úteis' },
    freteExpresso: { preco: 19.90, prazoMin: 1, prazoMax: 2, unidade: 'dias úteis' },
    descricao: 'Frete grátis para compras acima de R$ 99,00. Frete expresso por R$ 19,90 com entrega em 1 a 2 dias úteis.',
  },

  pagamento: {
    cartaoCredito: { parcelasMax: 6, semJuros: true, bandeiras: ['Visa', 'Mastercard', 'Elo', 'Amex'] },
    boleto:        { desconto: 0.10, descricao: '10% de desconto à vista' },
    pix:           { desconto: 0.10, descricao: '10% de desconto, processamento imediato' },
    debito:        { desconto: 0.05, descricao: '5% de desconto' },
  },

  trocaDevolucao: {
    prazoDesistenciaDias: 7,
    prazoDefeitoFabricaDias: 30,
    prazoReembolsoDias: 10,
    condicoes: [
      'Livro sem uso e na embalagem original',
      'Acompanhado de nota fiscal',
      'Solicitação via chat ou e-mail dentro do prazo',
    ],
  },
};

/**
 * Perguntas frequentes mapeadas a respostas prontas.
 * Chave: array de gatilhos (palavras/frases), Valor: resposta.
 */
const FAQ = [
  {
    gatilhos: ['frete', 'entrega', 'prazo', 'envio'],
    resposta:
      'Para capitais, o prazo é de 3 a 7 dias úteis. Para o interior, de 5 a 12 dias úteis. ' +
      'Temos frete expresso por R$ 19,90 (1 a 2 dias úteis). ' +
      'E frete grátis para compras acima de R$ 99,00! 📦',
  },
  {
    gatilhos: ['parcel', 'pagamento', 'pix', 'boleto', 'cartão', 'credito'],
    resposta:
      'Aceitamos cartão de crédito em até 6x sem juros (Visa, Mastercard, Elo, Amex), ' +
      'PIX com 10% de desconto (confirmação imediata), boleto com 10% de desconto e débito com 5% de desconto. 💳',
  },
  {
    gatilhos: ['troc', 'devolu', 'arrependimento', 'cancel'],
    resposta:
      'Você tem 7 dias após o recebimento para devolver o livro sem precisar dar explicações. ' +
      'O produto deve estar sem uso, na embalagem original e com nota fiscal. ' +
      'Defeito de fábrica? Fazemos a troca em até 30 dias. Reembolso em até 10 dias úteis. 🔄',
  },
  {
    gatilhos: ['garantia', 'original', 'falso'],
    resposta:
      'Todos os nossos livros são 100% originais, com nota fiscal e garantia da editora. ' +
      'Trabalhamos diretamente com as principais editoras do Brasil. ✅',
  },
  {
    gatilhos: ['rastrear', 'rastreamento', 'onde está', 'pedido'],
    resposta:
      'Você recebe o código de rastreamento por e-mail assim que o pedido for despachado. ' +
      'Também é possível acompanhar diretamente no site da PageStore. 📬',
  },
];

/**
 * Encontra uma resposta FAQ com base na mensagem do usuário.
 * @param {string} mensagem
 * @returns {string|null}
 */
function buscarFAQ(mensagem) {
  const msg = mensagem.toLowerCase();
  const encontrada = FAQ.find((item) =>
    item.gatilhos.some((gatilho) => msg.includes(gatilho))
  );
  return encontrada ? encontrada.resposta : null;
}

module.exports = { POLICIES, FAQ, buscarFAQ };
