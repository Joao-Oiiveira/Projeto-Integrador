/**
 * Utilitários de Validação de Campos do EduAcess (Frontend)
 *
 * Evita cadastro de disciplinas, baralhos, cartas, tarefas e temas
 * compostos apenas por números ou caracteres especiais/símbolos.
 */

// Regex para caracteres alfabéticos (incluindo acentuação em português)
const REGEX_LETRAS = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/;
const REGEX_TODAS_LETRAS = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g;

/**
 * Valida nomes e títulos essenciais (ex: Disciplinas, Baralhos, Tarefas, Eventos).
 *
 * Regras:
 * - Campo obrigatório (não vazio).
 * - Mínimo de caracteres (padrão: 2).
 * - Não pode ser composto apenas por números (ex: "12345").
 * - Não pode ser composto apenas por símbolos/pontuação (ex: "???", "---", "@#$%").
 * - Deve conter pelo menos uma quantidade mínima de letras (padrão: 2).
 *
 * @param {string} valor
 * @param {string} nomeAmigavel - Nome do campo para a mensagem de erro (ex: "nome da disciplina")
 * @param {object} opcoes - { minTamanho, maxTamanho, minLetras }
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export function validarTextoNome(valor, nomeAmigavel = 'campo', opcoes = {}) {
  const { minTamanho = 2, maxTamanho = 100, minLetras = 2 } = opcoes;

  if (!valor || typeof valor !== 'string' || !valor.trim()) {
    return `O ${nomeAmigavel} é obrigatório.`;
  }

  const texto = valor.trim();

  if (texto.length < minTamanho) {
    return `O ${nomeAmigavel} deve ter pelo menos ${minTamanho} caracteres.`;
  }

  if (texto.length > maxTamanho) {
    return `O ${nomeAmigavel} não pode ter mais de ${maxTamanho} caracteres.`;
  }

  // Verifica se é composto APENAS por números (ou números com espaços/pontuação puramente numérica)
  if (/^\d+$/.test(texto) || (/^[\d\s.,\-]+$/.test(texto) && !REGEX_LETRAS.test(texto))) {
    return `O ${nomeAmigavel} não pode ser composto apenas por números. Digite um nome que contenha letras.`;
  }

  // Verifica se não contém nenhuma letra
  if (!REGEX_LETRAS.test(texto)) {
    return `O ${nomeAmigavel} não pode ser composto apenas por símbolos ou caracteres especiais. Digite um nome com letras.`;
  }

  // Contagem de letras reais
  const letrasEncontradas = texto.match(REGEX_TODAS_LETRAS) || [];
  if (letrasEncontradas.length < minLetras) {
    return `O ${nomeAmigavel} deve conter pelo menos ${minLetras} letras legíveis.`;
  }

  return null;
}

/**
 * Valida descrições ou textos opcionais.
 *
 * Regras:
 * - Se for vazio, é considerado válido (pois é opcional).
 * - Se preenchido, não pode conter APENAS símbolos/pontuação.
 */
export function validarTextoDescricao(valor, nomeAmigavel = 'descrição', opcoes = {}) {
  const { maxTamanho = 500 } = opcoes;

  if (!valor || typeof valor !== 'string' || !valor.trim()) {
    return null;
  }

  const texto = valor.trim();

  if (texto.length > maxTamanho) {
    return `A ${nomeAmigavel} não pode ter mais de ${maxTamanho} caracteres.`;
  }

  // Se preencheu, precisa conter pelo menos alguma letra ou número legível
  if (!/[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(texto)) {
    return `A ${nomeAmigavel} não pode conter apenas símbolos ou pontuação.`;
  }

  return null;
}

/**
 * Valida temas para requisições de Inteligência Artificial (Flashcards e Exercícios).
 */
export function validarTemaIA(tema) {
  if (!tema || typeof tema !== 'string' || !tema.trim()) {
    return 'Por favor, informe o tema de estudo para a IA gerar o conteúdo.';
  }

  const texto = tema.trim();

  if (texto.length < 2) {
    return 'O tema informado é muito curto. Digite pelo menos 2 caracteres.';
  }

  if (texto.length > 250) {
    return 'O tema informado é muito longo (máximo de 250 caracteres).';
  }

  if (/^\d+$/.test(texto) || (/^[\d\s.,\-]+$/.test(texto) && !REGEX_LETRAS.test(texto))) {
    return 'O tema não pode ser composto apenas por números. Digite um assunto acadêmico (ex: Fotossíntese, Revolução Francesa).';
  }

  if (!REGEX_LETRAS.test(texto)) {
    return 'O tema não pode ser composto apenas por símbolos ou caracteres especiais. Informe um assunto real de estudo.';
  }

  const letras = texto.match(REGEX_TODAS_LETRAS) || [];
  if (letras.length < 2) {
    return 'O tema deve conter pelo menos 2 letras legíveis.';
  }

  return null;
}

