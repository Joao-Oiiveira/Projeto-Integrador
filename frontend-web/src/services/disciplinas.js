const API_URL = 'http://127.0.0.1:8000/disciplinas';
const TOKEN_KEY = '@EduAcess:token';

// Função auxiliar para pegar o token e montar o cabeçalho
const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Usuário não autenticado");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obterDisciplinasAPI = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao buscar disciplinas");
  return await response.json();
};

export const criarDisciplinaAPI = async (dados) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao criar disciplina");
  return data;
};

export const atualizarDisciplinaAPI = async (id, dadosAtualizados) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dadosAtualizados)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao atualizar disciplina");
  return data;
};

export const excluirDisciplinaAPI = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Erro ao excluir disciplina");
  }
};