import { throwIfNotOk } from '../utils/errorHandler';

const API_URL = 'http://127.0.0.1:8000/eventos';
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

export const obterEventos = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível carregar os eventos. Tente novamente.");
  return await response.json();
};

export const criarEvento = async (dados) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      data_inicio: dados.data_inicio,
      data_fim: dados.data_fim || dados.data_inicio, // Previne erro caso o usuário não preencha o fim
      disciplina_id: dados.disciplina_id ? Number(dados.disciplina_id) : null
    })
  });
  await throwIfNotOk(response, "Não foi possível criar o evento. Tente novamente.");
  return await response.json();
};

export const excluirEvento = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  await throwIfNotOk(response, "Não foi possível excluir o evento. Tente novamente.");
};

export const atualizarEvento = async (id, dadosAtualizados) => {
  const token = localStorage.getItem('@EduAcess:token');
  if (!token) {
    const err = new Error("Usuário não autenticado");
    err.statusCode = 401;
    throw err;
  }

  const response = await fetch(`http://127.0.0.1:8000/eventos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      titulo: dadosAtualizados.titulo,
      descricao: dadosAtualizados.descricao || '',
      data_inicio: dadosAtualizados.data_inicio,
      data_fim: dadosAtualizados.data_fim || dadosAtualizados.data_inicio,
      disciplina_id: dadosAtualizados.disciplina_id ? Number(dadosAtualizados.disciplina_id) : null
    })
  });
  await throwIfNotOk(response, "Não foi possível atualizar o evento. Tente novamente.");
};