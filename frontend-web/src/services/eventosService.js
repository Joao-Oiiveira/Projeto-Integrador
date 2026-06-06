const API_URL = 'http://127.0.0.1:8000/eventos';
const TOKEN_KEY = '@EduAcess:token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Usuário não autenticado");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const obterEventos = async () => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error("Erro ao buscar eventos");
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
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Erro ao criar evento");
  return data;
};

export const excluirEvento = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  if (!response.ok) throw new Error("Erro ao excluir evento");
};