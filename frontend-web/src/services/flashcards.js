const API_URL = 'http://127.0.0.1:8000/estudos';
const TOKEN_KEY = '@EduAcess:token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Usuário não autenticado");
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

// --- BARALHOS ---
export const obterBaralhos = async () => {
  const response = await fetch(`${API_URL}/baralhos`, { headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao buscar baralhos");
  return await response.json();
};

export const criarBaralho = async (dados) => {
  const response = await fetch(`${API_URL}/baralhos`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ nome: dados.nome, disciplina_id: dados.disciplina_id ? Number(dados.disciplina_id) : null })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao criar baralho");
  return data;
};

export const atualizarBaralho = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/baralhos/${id}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ nome: dadosAtualizados.nome, disciplina_id: dadosAtualizados.disciplina_id ? Number(dadosAtualizados.disciplina_id) : null })
  });
  if (!response.ok) throw new Error("Erro ao atualizar baralho");
};

export const excluirBaralho = async (id) => {
  const response = await fetch(`${API_URL}/baralhos/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao excluir baralho");
};

// --- FLASHCARDS ---
export const obterTodosFlashcards = async () => {
  const response = await fetch(`${API_URL}/flashcards`, { headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao buscar flashcards");
  return await response.json();
};

export const criarFlashcard = async (dados) => {
  const response = await fetch(`${API_URL}/flashcards`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ baralho_id: Number(dados.baralho_id), pergunta: dados.pergunta, resposta: dados.resposta })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao criar carta");
  return data;
};

export const atualizarFlashcard = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/flashcards/${id}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ pergunta: dadosAtualizados.pergunta, resposta: dadosAtualizados.resposta })
  });
  if (!response.ok) throw new Error("Erro ao atualizar carta");
};

export const excluirFlashcard = async (id) => {
  const response = await fetch(`${API_URL}/flashcards/${id}`, { method: 'DELETE', headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao excluir carta");
};

// --- ESTUDO ---
export const registrarResultadoEstudo = async (flashcardId, acertou) => {
  const response = await fetch(`${API_URL}/flashcards/${flashcardId}/estudo`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ acertou })
  });
  if (!response.ok) throw new Error("Erro ao registrar estudo");
};

export const gerarFlashcardsIA = async (baralhoId, tema, dificuldade, quantidade) => {
  const token = localStorage.getItem('@EduAcess:token');
  const response = await fetch(`http://127.0.0.1:8000/estudos/baralhos/${baralhoId}/gerar-ia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tema, dificuldade, quantidade: Number(quantidade) })
  });
  if (!response.ok) throw new Error("Erro ao gerar flashcards com IA");
  return await response.json();
};