// services/tarefas.js

const API_URL = 'http://127.0.0.1:8000/tarefas';
const TOKEN_KEY = '@EduAcess:token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Usuário não autenticado");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obterTarefas = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao buscar tarefas");
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao criar tarefa");
  return data;
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao atualizar tarefa");
  return data;
};

export const atualizarStatusTarefa = async (id, novoStatus) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: novoStatus })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao atualizar status");
  return data;
};

export const excluirTarefa = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Erro ao excluir tarefa");
  }
};