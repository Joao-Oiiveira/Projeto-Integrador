import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import ConfirmModal from '../components/ConfirmModal'; // NOVO: Importação do Modal de Confirmação
import { obterTarefas, criarTarefa, atualizarStatusTarefa, atualizarTarefa, excluirTarefa } from '../services/tarefas';
import { obterDisciplinasAPI } from '../services/disciplinas';

const Tarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('todas');

  // NOVO: Estado para o Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    data_entrega: '',
    disciplina_id: ''
  });

  const hojeString = new Date().toISOString().split('T')[0];
  const dataHojeObj = new Date();
  dataHojeObj.setHours(0, 0, 0, 0);

  const carregarDados = async () => {
    try {
      const [tarefasData, disciplinasData] = await Promise.all([
        obterTarefas(),
        obterDisciplinasAPI()
      ]);
      setTarefas(tarefasData);
      setDisciplinas(disciplinasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setNovaTarefa({ titulo: '', descricao: '', data_entrega: '', disciplina_id: '' });
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (tarefa) => {
    setEditandoId(tarefa.id);
    setNovaTarefa({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      data_entrega: tarefa.data_entrega ? tarefa.data_entrega.split('T')[0] : '',
      disciplina_id: tarefa.disciplina_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSalvarTarefa = async (e) => {
    e.preventDefault();
    if (!novaTarefa.titulo || !novaTarefa.disciplina_id || !novaTarefa.data_entrega) {
      alert("Preencha os campos obrigatórios (Título, Disciplina e Data)");
      return;
    }

    if (novaTarefa.data_entrega < hojeString) {
      alert("Não é possível definir uma data de entrega no passado.");
      return;
    }

    try {
      if (editandoId) {
        await atualizarTarefa(editandoId, novaTarefa);
      } else {
        await criarTarefa(novaTarefa);
      }
      await carregarDados(); 
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // ==========================================
  // LÓGICA DE EXCLUSÃO COM CONFIRM MODAL
  // ==========================================
  const handleExcluirClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmarExclusao = async () => {
    try {
      await excluirTarefa(confirmModal.id);
      await carregarDados();
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      alert(error.message);
    }
  };

  const moverTarefa = async (id, novoStatus) => {
    try {
      await atualizarStatusTarefa(id, novoStatus);
      await carregarDados();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatarData = (dataIso) => {
    if (!dataIso) return '';
    const data = new Date(`${dataIso.split('T')[0]}T12:00:00`);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isAtrasada = (dataIso, status) => {
    if (status === 'concluida' || !dataIso) return false;
    const tDate = new Date(`${dataIso.split('T')[0]}T12:00:00`);
    tDate.setHours(0, 0, 0, 0);
    return tDate < dataHojeObj;
  };

  const tarefasFiltradasEOrdenadas = [...tarefas]
    .filter(tarefa => {
      if (!tarefa.data_entrega) return true;
      const tDate = new Date(`${tarefa.data_entrega.split('T')[0]}T12:00:00`);
      tDate.setHours(0, 0, 0, 0);
      const atrasada = isAtrasada(tarefa.data_entrega, tarefa.status);

      if (filtroAtivo === 'hoje') {
        return tDate.getTime() === dataHojeObj.getTime() || atrasada;
      }
      if (filtroAtivo === 'semana') {
        const limite = new Date(dataHojeObj);
        limite.setDate(limite.getDate() + 7);
        return (tDate >= dataHojeObj && tDate <= limite) || atrasada;
      }
      if (filtroAtivo === 'mes') {
        return (tDate.getMonth() === dataHojeObj.getMonth() && tDate.getFullYear() === dataHojeObj.getFullYear()) || atrasada;
      }
      return true;
    })
    .sort((a, b) => {
      if (!a.data_entrega || !b.data_entrega) return 0;
      return new Date(`${a.data_entrega.split('T')[0]}T12:00:00`) - new Date(`${b.data_entrega.split('T')[0]}T12:00:00`);
    });

  const pendentes = tarefasFiltradasEOrdenadas.filter(t => t.status === 'pendente');
  const emAndamento = tarefasFiltradasEOrdenadas.filter(t => t.status === 'em_andamento');
  const concluidas = tarefasFiltradasEOrdenadas.filter(t => t.status === 'concluida');

  const ColunaTarefas = ({ titulo, tarefasColuna, statusColor }) => (
    <div className="flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-800/50 p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 w-full h-[500px] lg:h-[600px] transition-colors">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
          {titulo}
        </h3>
        <span className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
          {tarefasColuna.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 custom-scrollbar h-full">
        {tarefasColuna.map(tarefa => {
          const disciplina = disciplinas.find(d => String(d.id) === String(tarefa.disciplina_id));
          const atrasada = isAtrasada(tarefa.data_entrega, tarefa.status);

          return (
            <div key={tarefa.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-all group shrink-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {disciplina?.nome || 'Geral'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModalEdicao(tarefa)} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {/* ATUALIZADO: Chama a função que abre o ConfirmModal */}
                  <button onClick={() => handleExcluirClick(tarefa.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{tarefa.titulo}</h4>
              {tarefa.descricao && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{tarefa.descricao}</p>}
              
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-2 border-t border-gray-50 dark:border-gray-700">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${atrasada ? 'text-red-500 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-lg' : 'text-gray-400 dark:text-gray-500'}`}>
                  {atrasada ? 'Atrasada' : formatarData(tarefa.data_entrega)}
                </div>

                <select 
                  value={tarefa.status}
                  onChange={(e) => moverTarefa(tarefa.id, e.target.value)}
                  className="text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-purple-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organize seus estudos por prioridade.</p>
        </div>
        <Button text="+ Nova Tarefa" onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'hoje', label: 'Hoje' },
          { id: 'semana', label: 'Próximos 7 dias' },
          { id: 'mes', label: 'Este mês' },
          { id: 'todas', label: 'Todas as Tarefas' },
        ].map(filtro => (
          <button
            key={filtro.id}
            onClick={() => setFiltroAtivo(filtro.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
              filtroAtivo === filtro.id 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full h-full lg:overflow-hidden">
        <ColunaTarefas titulo="Pendentes" tarefasColuna={pendentes} statusColor="bg-red-400" />
        <ColunaTarefas titulo="Em Andamento" tarefasColuna={emAndamento} statusColor="bg-yellow-400" />
        <ColunaTarefas titulo="Concluídas" tarefasColuna={concluidas} statusColor="bg-green-400" />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Tarefa" : "Criar Nova Tarefa"}>
        <form onSubmit={handleSalvarTarefa} className="flex flex-col gap-4">
          <Input id="titulo" label="Título da Tarefa *" placeholder="Ex: Resolver lista de exercícios" value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 transition-all resize-none h-24" placeholder="Detalhes da tarefa..." value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})}></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina *</label>
              <select className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 transition-all" value={novaTarefa.disciplina_id} onChange={e => setNovaTarefa({...novaTarefa, disciplina_id: e.target.value})}>
                <option value="">Selecione...</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <Input id="data_entrega" label="Data de Entrega *" type="date" min={hojeString} value={novaTarefa.data_entrega} onChange={e => setNovaTarefa({...novaTarefa, data_entrega: e.target.value})} />
            </div>
          </div>

          <Button type="submit" text={editandoId ? "Salvar Alterações" : "Criar Tarefa"} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white" />
        </form>
      </Modal>

      {/* NOVO: MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não poderá ser desfeita."
        confirmText="Excluir Tarefa"
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
};

export default Tarefas;