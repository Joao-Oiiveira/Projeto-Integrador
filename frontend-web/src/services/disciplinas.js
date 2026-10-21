import { throwIfNotOk } from '../utils/errorHandler';

const API_URL = 'http://127.0.0.1:8000/disciplinas';
const TOKEN_KEY = '@EduAcess:token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const err = new Error("Usuário não autenticado");
    err.statusCode = 401;
    throw err;
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obterDisciplinasAPI = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível carregar as disciplinas. Tente novamente.");
  return await response.json();
};

export const criarDisciplinaAPI = async (dados) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  await throwIfNotOk(response, "Não foi possível criar a disciplina. Tente novamente.");
  return await response.json();
};

export const atualizarDisciplinaAPI = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dadosAtualizados)
  });
  await throwIfNotOk(response, "Não foi possível atualizar a disciplina. Tente novamente.");
  return await response.json();
};

export const excluirDisciplinaAPI = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  await throwIfNotOk(response, "Não foi possível excluir a disciplina. Tente novamente.");
};