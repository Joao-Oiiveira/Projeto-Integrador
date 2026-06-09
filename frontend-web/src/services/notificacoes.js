// services/notificacoes.js

const API_URL = 'http://127.0.0.1:8000/notificacoes';
const TOKEN_KEY = '@EduAcess:token';

// Função auxiliar para pegar o token direto do localStorage
const getToken = () => localStorage.getItem(TOKEN_KEY);

export const obterNotificacoes = async () => {
  const token = getToken();
  if (!token) return [];

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Erro ao buscar notificações");
  return await response.json();
};

export const criarNotificacao = async (titulo, descricao) => {
  const token = getToken();
  if (!token) return;

  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ titulo, descricao })
  });
};

export const marcarComoLida = async (id) => {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/${id}/lida`, { 
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

export const marcarTodasComoLidas = async () => {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/marcar-todas-lidas`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

export const excluirNotificacao = async (id) => {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};