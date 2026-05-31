import { getLoggedUser } from './auth';

const DB_TAREFAS = '@EduAcess:tarefas';


export const obterTarefas = () => {
  const user = getLoggedUser();
  if (!user) return[];
  const todasTarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  return todasTarefas.filter(t => t.usuario_id === user.id);
};

export const criarTarefa = (dados) => {
  const user = getLoggedUser();
  if (!user) throw new Error("Usuário não autenticado");

  const tarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  const novaTarefa = {
    id: tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 1,
    usuario_id: user.id,
    // CORREÇÃO: Salva como Number para o .find() do React funcionar
    disciplina_id: Number(dados.disciplina_id), 
    titulo: dados.titulo,
    descricao: dados.descricao || '',
    data_entrega: dados.data_entrega,
    status: 'pendente',
    ativo: true,
    data_atualizacao: new Date().toISOString()
  };

  tarefas.push(novaTarefa);
  localStorage.setItem(DB_TAREFAS, JSON.stringify(tarefas));
  return novaTarefa;
};

export const atualizarTarefa = (id, dadosAtualizados) => {
  const tarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  const index = tarefas.findIndex(t => t.id === id);
  
  if (index !== -1) {
    tarefas[index] = { ...tarefas[index], ...dadosAtualizados, data_atualizacao: new Date().toISOString() };
    localStorage.setItem(DB_TAREFAS, JSON.stringify(tarefas));
  }
};

export const excluirTarefa = (id) => {
  let tarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  tarefas = tarefas.filter(t => t.id !== id);
  localStorage.setItem(DB_TAREFAS, JSON.stringify(tarefas));
};

export const atualizarStatusTarefa = (id, novoStatus) => {
  const tarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  const index = tarefas.findIndex(t => t.id === id);
  if (index !== -1) {
    tarefas[index].status = novoStatus;
    localStorage.setItem(DB_TAREFAS, JSON.stringify(tarefas));
  }
};