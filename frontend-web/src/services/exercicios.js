import { throwIfNotOk } from '../utils/errorHandler';

const API_URL = 'http://127.0.0.1:8000/exercicios';
const TOKEN_KEY = '@EduAcess:token';

// Função auxiliar para pegar o token
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Rota 1: Iniciar Sessão
export const iniciarSessaoExercicios = async (dados) => {
  const token = getToken();
  if (!token) {
    const err = new Error("Usuário não autenticado.");
    err.statusCode = 401;
    throw err;
  }

  const response = await fetch(`${API_URL}/sessao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      disciplina_id: dados.disciplina_id || null,
      tema: dados.tema || "",
      modo: dados.dificuldade || "médio", // Mandamos a dificuldade dentro da chave 'modo' para a API Python
      quantidade_questoes: Number(dados.quantidade_questoes) || 5
    })
  });

  await throwIfNotOk(response, "Não foi possível buscar as questões. Tente novamente.");
  return await response.json();
};

// Rota 2: Responder Questão (Salvar histórico em background)
export const responderQuestaoAPI = async (sessaoId, dados) => {
  const token = getToken();
  if (!token) return; 

  try {
    const response = await fetch(`${API_URL}/sessao/${sessaoId}/responder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        identificador_externo: dados.identificador_externo,
        pergunta: dados.pergunta,
        alternativa_marcada: dados.alternativa_marcada,
        alternativa_correta: dados.alternativa_correta,
        origem: dados.origem || "ia"
      })
    });

    if (!response.ok) {
      console.error("[EduAcess][responderQuestaoAPI] Erro ao salvar resposta em background.", response.status);
    }
  } catch (error) {
    console.error("[EduAcess][responderQuestaoAPI] Falha na comunicação ao salvar resposta:", error);
  }
};

// Rota 3: Obter Relatório de Desempenho
export const obterRelatorioExercicios = async () => {
  const token = getToken();
  if (!token) {
    const err = new Error("Usuário não autenticado.");
    err.statusCode = 401;
    throw err;
  }

  const response = await fetch(`${API_URL}/relatorio`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  await throwIfNotOk(response, "Não foi possível carregar o relatório. Tente novamente.");
  return await response.json();
};