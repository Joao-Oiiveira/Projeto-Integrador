/**
 * errorHandler.js
 *
 * Utilitário central de tratamento de erros do EduAcess.
 * Classifica erros e retorna mensagens amigáveis ao usuário,
 * mantendo logs técnicos disponíveis no console para desenvolvimento.
 *
 * Tipos de erro identificados:
 *  - VALIDATION   → dados inválidos ou campos faltando
 *  - NETWORK      → falha de comunicação com o backend
 *  - AUTH         → sessão expirada ou não autenticado
 *  - NOT_FOUND    → recurso não encontrado (404)
 *  - SERVER       → erro interno no servidor (5xx)
 *  - UNEXPECTED   → qualquer outro erro desconhecido
 */

// ============================================================
// Mapeamento de status HTTP → tipo de erro semântico
// ============================================================
const HTTP_STATUS_MAP = {
  400: 'VALIDATION',
  401: 'AUTH',
  403: 'AUTH',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION',
  429: 'RATE_LIMIT',
  500: 'SERVER',
  502: 'NETWORK',
  503: 'NETWORK',
  504: 'NETWORK',
};

// ============================================================
// Mensagens amigáveis por tipo de erro
// ============================================================
const USER_MESSAGES = {
  VALIDATION: {
    title: 'Dados inválidos',
    message: 'Verifique os campos destacados antes de continuar.',
    action: 'Corrija as informações e tente novamente.',
  },
  AUTH: {
    title: 'Sessão expirada',
    message: 'Você precisa fazer login para continuar.',
    action: 'Faça login novamente para continuar.',
  },
  NOT_FOUND: {
    title: 'Não encontrado',
    message: 'O item que você tentou acessar não existe ou foi removido.',
    action: null,
  },
  CONFLICT: {
    title: 'Dado já existente',
    message: 'Já existe um registro com essas informações.',
    action: 'Tente usar dados diferentes.',
  },
  RATE_LIMIT: {
    title: 'Muitas tentativas',
    message: 'Você fez muitas requisições em pouco tempo.',
    action: 'Aguarde alguns instantes e tente novamente.',
  },
  NETWORK: {
    title: 'Falha de conexão',
    message: 'Não foi possível conectar ao servidor.',
    action: 'Verifique sua conexão com a internet e tente novamente.',
  },
  SERVER: {
    title: 'Erro no servidor',
    message: 'O servidor encontrou um problema ao processar sua solicitação.',
    action: 'Tente novamente em alguns instantes.',
  },
  UNEXPECTED: {
    title: 'Erro inesperado',
    message: 'Ocorreu um erro inesperado.',
    action: 'Se o problema persistir, recarregue a página.',
  },
};

// ============================================================
// Classificador principal
// ============================================================

/**
 * Classifica um erro e retorna um objeto estruturado com:
 *  - type: string (tipo semântico)
 *  - title: string (título amigável)
 *  - message: string (mensagem para o usuário)
 *  - action: string | null (sugestão de ação)
 *  - technical: string (mensagem técnica para log)
 *
 * @param {Error|unknown} error - Erro capturado no catch
 * @param {string} [context] - Contexto opcional para o log (ex: "criarTarefa")
 */
export function classifyError(error, context = '') {
  // Log técnico sempre disponível para desenvolvimento
  if (context) {
    console.error(`[EduAcess][${context}]`, error);
  } else {
    console.error('[EduAcess]', error);
  }

  // Sem conexão com a internet (TypeError: Failed to fetch)
  if (
    error instanceof TypeError &&
    (error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('fetch'))
  ) {
    return buildResult('NETWORK', error.message);
  }

  // Erros com statusCode (quando o serviço lança com .statusCode)
  if (error?.statusCode) {
    const type = HTTP_STATUS_MAP[error.statusCode] || 'SERVER';
    return buildResult(type, error.message);
  }

  // Erros com mensagem mapeável por palavra-chave (vindos dos services)
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('não autenticado') || msg.includes('token')) {
    return buildResult('AUTH', error.message);
  }
  if (msg.includes('preencha') || msg.includes('obrigatório') || msg.includes('inválido')) {
    return buildResult('VALIDATION', error.message);
  }
  if (msg.includes('failed to fetch') || msg.includes('load failed')) {
    return buildResult('NETWORK', error.message);
  }

  // Mensagem técnica que veio da API mas é genérica demais
  if (error?.message) {
    return buildResult('UNEXPECTED', error.message);
  }

  return buildResult('UNEXPECTED', String(error));
}

/**
 * Formata a mensagem amigável completa (mensagem + ação).
 *
 * @param {ReturnType<classifyError>} classified
 * @returns {string}
 */
export function formatUserMessage(classified) {
  const parts = [classified.message];
  if (classified.action) parts.push(classified.action);
  return parts.join(' ');
}

// ============================================================
// Helpers internos
// ============================================================
function buildResult(type, technical) {
  const template = USER_MESSAGES[type] || USER_MESSAGES.UNEXPECTED;
  return {
    type,
    title: template.title,
    message: template.message,
    action: template.action,
    technical: technical || '',
  };
}

// ============================================================
// Conveniência: lança erro enriquecido quando response não é ok
// ============================================================

/**
 * Lança um erro enriquecido quando a resposta HTTP não é ok.
 * Tenta extrair `data.detail` do corpo JSON.
 *
 * @param {Response} response - Resposta do fetch
 * @param {string} [fallbackMessage] - Mensagem padrão se não houver detail
 */
export async function throwIfNotOk(response, fallbackMessage = 'Erro na operação.') {
  if (response.ok) return;

  let detail = fallbackMessage;
  try {
    const data = await response.json();
    detail = data.detail || fallbackMessage;
  } catch {
    // Corpo não é JSON — usa o fallback
  }

  const err = new Error(detail);
  err.statusCode = response.status;
  throw err;
}
