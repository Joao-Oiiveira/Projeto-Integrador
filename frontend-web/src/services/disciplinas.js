import { getLoggedUser } from './auth';

const DB_DISCIPLINAS = '@EduAcess:disciplinas';
const DB_TAREFAS = '@EduAcess:tarefas';

// Array de cores para a interface ficar bonita e organizada
const CORES_DISPONIVEIS =[
  'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700'
];

export const obterDisciplinas = () => {
  const user = getLoggedUser();
  if (!user) return[];

  const disciplinas = JSON.parse(localStorage.getItem(DB_DISCIPLINAS)) ||[];
  return disciplinas.filter(d => d.usuario_id === user.id && d.ativo === true);
};

export const criarDisciplina = (dados) => {
  const user = getLoggedUser();
  if (!user) throw new Error("Usuário não autenticado");

  const disciplinas = JSON.parse(localStorage.getItem(DB_DISCIPLINAS)) ||[];
  
  // Sorteia uma cor baseada no tamanho do array
  const corAtribuida = CORES_DISPONIVEIS[disciplinas.length % CORES_DISPONIVEIS.length];

  const novaDisciplina = {
    id: disciplinas.length > 0 ? Math.max(...disciplinas.map(d => d.id)) + 1 : 1,
    usuario_id: user.id,
    nome: dados.nome,
    descricao: dados.descricao || '',
    origem: 'manual',
    ativo: true,
    cor: corAtribuida, // Adicionado para manter a identidade visual do sistema
    data_atualizacao: new Date().toISOString()
  };

  disciplinas.push(novaDisciplina);
  localStorage.setItem(DB_DISCIPLINAS, JSON.stringify(disciplinas));
  return novaDisciplina;
};

export const atualizarDisciplina = (id, dadosAtualizados) => {
  const disciplinas = JSON.parse(localStorage.getItem(DB_DISCIPLINAS)) ||[];
  const index = disciplinas.findIndex(d => d.id === id);
  
  if (index !== -1) {
    disciplinas[index] = { 
      ...disciplinas[index], 
      nome: dadosAtualizados.nome,
      descricao: dadosAtualizados.descricao,
      data_atualizacao: new Date().toISOString() 
    };
    localStorage.setItem(DB_DISCIPLINAS, JSON.stringify(disciplinas));
  }
};

export const excluirDisciplina = (id) => {
  // REGRA DE NEGÓCIO: Bloquear exclusão se houver tarefas atreladas
  const tarefas = JSON.parse(localStorage.getItem(DB_TAREFAS)) ||[];
  const possuiTarefas = tarefas.some(t => String(t.disciplina_id) === String(id));

  if (possuiTarefas) {
    throw new Error("Esta disciplina possui tarefas vinculadas. Conclua ou exclua as tarefas primeiro!");
  }

  let disciplinas = JSON.parse(localStorage.getItem(DB_DISCIPLINAS)) ||[];
  disciplinas = disciplinas.filter(d => d.id !== id);
  localStorage.setItem(DB_DISCIPLINAS, JSON.stringify(disciplinas));
};