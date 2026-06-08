const API_URL = 'http://127.0.0.1:8000/exercicios';
const TOKEN_KEY = '@EduAcess:token';

// Função auxiliar para pegar o token
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Rota 1: Iniciar Sessão
export const iniciarSessaoExercicios = async (dados) => {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado.");

  const response = await fetch(`${API_URL}/sessao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      disciplina_id: dados.disciplina_id || null,
      tema: dados.tema || "",
      modo: dados.modo || "vestibular",
      quantidade_questoes: Number(dados.quantidade_questoes) || 5
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Erro ao buscar questões. Tente novamente.");
  }
  return data;
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
        origem: dados.origem || "enem_api"
      })
    });

    if (!response.ok) {
      console.error("Erro ao salvar resposta no background.");
    }
  } catch (error) {
    console.error("Falha na comunicação ao salvar resposta:", error);
  }
};