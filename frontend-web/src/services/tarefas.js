// services/tarefas.js
import { throwIfNotOk } from '../utils/errorHandler';

const API_URL = 'http://127.0.0.1:8000/tarefas';
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

export const obterTarefas = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  await throwIfNotOk(response, "Não foi possível carregar as tarefas. Tente novamente.");
  return await response.json();
};

export const criarTarefa = async (dados) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      titulo: dados.titulo,
      descricao: dados.descricao || '',
      data_entrega: dados.data_entrega,
      disciplina_id: dados.disciplina_id ? Number(dados.disciplina_id) : null
    })
  });
  await throwIfNotOk(response, "Não foi possível criar a tarefa. Tente novamente.");
  return await response.json();
};

export const atualizarTarefa = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      titulo: dadosAtualizados.titulo,
      descricao: dadosAtualizados.descricao || '',
      data_entrega: dadosAtualizados.data_entrega,
      disciplina_id: dadosAtualizados.disciplina_id ? Number(dadosAtualizados.disciplina_id) : null
    })
  });
  await throwIfNotOk(response, "Não foi possível atualizar a tarefa. Tente novamente.");
  return await response.json();
};

export const atualizarStatusTarefa = async (id, novoStatus) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: novoStatus })
  });
  await throwIfNotOk(response, "Não foi possível atualizar o status da tarefa. Tente novamente.");
  return await response.json();
};

export const excluirTarefa = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  await throwIfNotOk(response, "Não foi possível excluir a tarefa. Tente novamente.");
};