'use strict';

/**
 * Catálogo de livros da PageStore.
 * Cada produto contém todas as informações que o BookBot usa para responder clientes.
 */
const CATALOG = [
  {
    id: 'senhor-dos-aneis',
    titulo: 'O Senhor dos Anéis',
    autor: 'J.R.R. Tolkien',
    genero: ['fantasia', 'aventura', 'épico'],
    formato: 'Box com 3 volumes (capa dura)',
    editora: 'HarperCollins Brasil',
    paginas: 1216,
    preco: 189.90,
    parcelamento: { parcelas: 6, valorParcela: 31.65, semJuros: true },
    garantia: 'Livros originais com nota fiscal',
    estoque: 'disponivel',
    descricao: 'A trilogia épica completa de Tolkien — A Sociedade do Anel, As Duas Torres e O Retorno do Rei. Um clássico absoluto da fantasia.',
    indicadoPara: ['adultos', 'fas-de-fantasia', 'leitores-experientes'],
    palavrasChave: ['tolkien', 'anel', 'hobbit', 'fantasia epica', 'classico'],
  },
  {
    id: 'habitos-atomicos',
    titulo: 'Hábitos Atômicos',
    autor: 'James Clear',
    genero: ['autoajuda', 'desenvolvimento-pessoal', 'produtividade'],
    formato: 'Brochura',
    editora: 'Alta Books',
    paginas: 320,
    preco: 49.90,
    parcelamento: { parcelas: 3, valorParcela: 16.63, semJuros: true },
    garantia: 'Livros originais com nota fiscal',
    estoque: 'disponivel',
    descricao: 'Um guia prático para construir bons hábitos e eliminar os ruins, com metodologia baseada em ciência comportamental.',
    indicadoPara: ['adultos', 'profissionais', 'quem-quer-se-desenvolver'],
    palavrasChave: ['habitos', 'produtividade', 'autoajuda', 'james clear', 'desenvolvimento'],
  },
  {
    id: 'dom-casmurro',
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    genero: ['literatura-brasileira', 'classico', 'romance'],
    formato: 'Brochura',
    editora: 'Martin Claret',
    paginas: 256,
    preco: 29.90,
    parcelamento: { parcelas: 1, valorParcela: 29.90, semJuros: true },
    garantia: 'Livros originais com nota fiscal',
    estoque: 'disponivel',
    descricao: 'O clássico de Machado de Assis sobre Bentinho e Capitu — uma das maiores obras da literatura brasileira.',
    indicadoPara: ['estudantes', 'fas-de-classicos', 'literatura-brasileira'],
    palavrasChave: ['machado de assis', 'classico', 'literatura brasileira', 'capitu', 'escola'],
  },
  {
    id: 'clean-code',
    titulo: 'Clean Code — O Código Limpo',
    autor: 'Robert C. Martin',
    genero: ['tecnologia', 'programacao', 'boas-praticas'],
    formato: 'Brochura',
    editora: 'Alta Books',
    paginas: 464,
    preco: 89.90,
    parcelamento: { parcelas: 4, valorParcela: 22.48, semJuros: true },
    garantia: 'Livros originais com nota fiscal',
    estoque: 'ultimas-unidades',
    descricao: 'Manual essencial para programadores sobre como escrever código legível, sustentável e de qualidade.',
    indicadoPara: ['programadores', 'desenvolvedores', 'estudantes-de-ti'],
    palavrasChave: ['clean code', 'programacao', 'codigo', 'robert martin', 'desenvolvimento', 'ti'],
  },
  {
    id: 'harry-potter-pedra',
    titulo: 'Harry Potter e a Pedra Filosofal',
    autor: 'J.K. Rowling',
    genero: ['fantasia', 'infanto-juvenil', 'aventura'],
    formato: 'Capa dura — Edição Ilustrada',
    editora: 'Rocco',
    paginas: 272,
    preco: 79.90,
    parcelamento: { parcelas: 4, valorParcela: 19.98, semJuros: true },
    garantia: 'Livros originais com nota fiscal',
    estoque: 'disponivel',
    descricao: 'A edição ilustrada do primeiro livro da saga mais amada do mundo — perfeita para todas as idades.',
    indicadoPara: ['criancas', 'jovens', 'adultos-nostalgia', 'presente'],
    palavrasChave: ['harry potter', 'rowling', 'bruxo', 'hogwarts', 'fantasia', 'crianca', 'presente'],
  },
];

/**
 * Busca livros pelo gênero ou palavras-chave (case-insensitive).
 * @param {string} query
 * @returns {Array}
 */
function buscarPorGeneroOuPalavra(query) {
  const q = query.toLowerCase();
  return CATALOG.filter((livro) =>
    livro.genero.some((g) => g.includes(q)) ||
    livro.palavrasChave.some((p) => p.includes(q)) ||
    livro.titulo.toLowerCase().includes(q) ||
    livro.autor.toLowerCase().includes(q)
  );
}

/**
 * Retorna livros dentro de um orçamento máximo.
 * @param {number} orcamentoMax
 * @returns {Array}
 */
function buscarPorOrcamento(orcamentoMax) {
  return CATALOG.filter((livro) => livro.preco <= orcamentoMax);
}

/**
 * Retorna todos os livros disponíveis (estoque não esgotado).
 * @returns {Array}
 */
function listarDisponiveis() {
  return CATALOG.filter((livro) => livro.estoque !== 'esgotado');
}

/**
 * Formata um livro para exibição no chat.
 * @param {Object} livro
 * @returns {string}
 */
function formatarLivro(livro) {
  const estoque = livro.estoque === 'ultimas-unidades' ? '⚠️ Últimas unidades!' : '✅ Disponível';
  const parcela = livro.parcelamento.parcelas > 1
    ? ` ou ${livro.parcelamento.parcelas}x de R$ ${livro.parcelamento.valorParcela.toFixed(2).replace('.', ',')} sem juros`
    : '';
  return (
    `📖 *${livro.titulo}* — ${livro.autor}\n` +
    `Gênero: ${livro.genero.join(', ')}\n` +
    `Formato: ${livro.formato} | ${livro.paginas} páginas\n` +
    `Preço: R$ ${livro.preco.toFixed(2).replace('.', ',')}${parcela}\n` +
    `${estoque}\n` +
    `${livro.descricao}`
  );
}

module.exports = { CATALOG, buscarPorGeneroOuPalavra, buscarPorOrcamento, listarDisponiveis, formatarLivro };
