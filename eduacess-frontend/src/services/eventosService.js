import { getLoggedUser } from './auth';
import { mockEventos } from '../mocks/mockEventos';

const DB_EVENTOS = '@EduAcess:eventos';

export const obterEventos = () => {
  const user = getLoggedUser();
  if (!user) return [];

  let eventos = JSON.parse(localStorage.getItem(DB_EVENTOS));
  
  // Popula com o mock se estiver vazio
  if (!eventos || eventos.length === 0) {
    // Garante que o mock receba o ID do usuário atual
    eventos = mockEventos.map(e => ({ ...e, usuario_id: user.id }));
    localStorage.setItem(DB_EVENTOS, JSON.stringify(eventos));
  }

  return eventos.filter(e => e.usuario_id === user.id);
};

export const criarEvento = (dados) => {
  const user = getLoggedUser();
  if (!user) throw new Error("Usuário não autenticado");

  const eventos = JSON.parse(localStorage.getItem(DB_EVENTOS)) || [];
  
  const novoEvento = {
    id: eventos.length > 0 ? Math.max(...eventos.map(e => e.id)) + 1 : 1,
    usuario_id: user.id,
    disciplina_id: dados.disciplina_id ? Number(dados.disciplina_id) : null,
    titulo: dados.titulo,
    descricao: dados.descricao || '',
    data_inicio: dados.data_inicio, // formato ISO com hora
    data_fim: dados.data_fim // formato ISO com hora
  };

  eventos.push(novoEvento);
  localStorage.setItem(DB_EVENTOS, JSON.stringify(eventos));
  return novoEvento;
};

export const excluirEvento = (id) => {
  let eventos = JSON.parse(localStorage.getItem(DB_EVENTOS)) || [];
  eventos = eventos.filter(e => e.id !== id);
  localStorage.setItem(DB_EVENTOS, JSON.stringify(eventos));
};