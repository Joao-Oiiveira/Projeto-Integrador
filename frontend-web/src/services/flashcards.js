import { throwIfNotOk } from '../utils/errorHandler';

const API_URL = 'http://127.0.0.1:8000/estudos';
const TOKEN_KEY = '@EduAcess:token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const err = new Error("Usuário não autenticado");
    err.statusCode = 401;
    throw err;
  }
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

// --- BARALHOS ---
export const obterBaralhos = async () => {
  const response = await fetch(`${API_URL}/baralhos`, { headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível carregar os baralhos. Tente novamente.");
  return await response.json();
};

export const criarBaralho = async (dados) => {
  const response = await fetch(`${API_URL}/baralhos`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ nome: dados.nome, disciplina_id: dados.disciplina_id ? Number(dados.disciplina_id) : null })
  });
  await throwIfNotOk(response, "Não foi possível criar o baralho. Tente novamente.");
  return await response.json();
};

export const atualizarBaralho = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/baralhos/${id}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ nome: dadosAtualizados.nome, disciplina_id: dadosAtualizados.disciplina_id ? Number(dadosAtualizados.disciplina_id) : null })
  });
  await throwIfNotOk(response, "Não foi possível atualizar o baralho. Tente novamente.");
};

export const excluirBaralho = async (id) => {
  const response = await fetch(`${API_URL}/baralhos/${id}`, { method: 'DELETE', headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível excluir o baralho. Tente novamente.");
};

// --- FLASHCARDS ---
export const obterTodosFlashcards = async () => {
  const response = await fetch(`${API_URL}/flashcards`, { headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível carregar os flashcards. Tente novamente.");
  return await response.json();
};

export const criarFlashcard = async (dados) => {
  const response = await fetch(`${API_URL}/flashcards`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ baralho_id: Number(dados.baralho_id), pergunta: dados.pergunta, resposta: dados.resposta })
  });
  await throwIfNotOk(response, "Não foi possível criar o flashcard. Tente novamente.");
  return await response.json();
};

export const atualizarFlashcard = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/flashcards/${id}`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ pergunta: dadosAtualizados.pergunta, resposta: dadosAtualizados.resposta })
  });
  await throwIfNotOk(response, "Não foi possível atualizar o flashcard. Tente novamente.");
};

export const excluirFlashcard = async (id) => {
  const response = await fetch(`${API_URL}/flashcards/${id}`, { method: 'DELETE', headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível excluir o flashcard. Tente novamente.");
};

// --- ESTUDO ---
export const registrarResultadoEstudo = async (flashcardId, acertou) => {
  const response = await fetch(`${API_URL}/flashcards/${flashcardId}/estudo`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ acertou })
  });
  await throwIfNotOk(response, "Não foi possível registrar o resultado do estudo.");
};

export const gerarFlashcardsIA = async (baralhoId, tema, dificuldade, quantidade) => {
  const token = localStorage.getItem('@EduAcess:token');
  const response = await fetch(`http://127.0.0.1:8000/estudos/baralhos/${baralhoId}/gerar-ia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tema, dificuldade, quantidade: Number(quantidade) })
  });
  await throwIfNotOk(response, "Não foi possível gerar flashcards com IA. Tente novamente.");
  return await response.json();
};