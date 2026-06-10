import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal'; // NOVO: Importando o modal de confirmação
import { getDaysInMonth, formatToDateString, isSameDay } from '../utils/calendarUtils';

// Services
import { obterTarefas } from '../services/tarefas'; 
import { obterEventos, criarEvento, excluirEvento, atualizarEvento } from '../services/eventosService'; // NOVO: atualizarEvento adicionado
import { obterDisciplinasAPI } from '../services/disciplinas'; 

const Agenda = () => {
  const [tarefas, setTarefas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState('month');

  // Estados do Modal de Evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // NOVO: Controle de edição
  const [novoEvento, setNovoEvento] = useState({ titulo: '', descricao: '', data_inicio: '', data_fim: '', disciplina_id: '' });

  // NOVO: Estados do Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const carregarDados = async () => {
    try {
      const [tarefasData, eventosData, disciplinasData] = await Promise.all([
        obterTarefas(),
        obterEventos(),
        obterDisciplinasAPI()
      ]);
      setTarefas(tarefasData);
      setEventos(eventosData);
      setDisciplinas(disciplinasData);
    } catch (error) {
      console.error("Erro ao carregar dados da agenda:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const hoje = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // NOVO: Funções de abrir modais
  const abrirModalNovo = () => {
    setEditandoId(null);
    setNovoEvento({ titulo: '', descricao: '', data_inicio: '', data_fim: '', disciplina_id: '' });
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (evento) => {
    setEditandoId(evento.id);
    setNovoEvento({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      data_inicio: evento.data_inicio || '',
      data_fim: evento.data_fim || '',
      disciplina_id: evento.disciplina_id || ''
    });
    setIsModalOpen(true);
  };

  // ATUALIZADO: Lida com Criação e Edição
  const handleSalvarEvento = async (e) => {
    e.preventDefault();
    if (!novoEvento.titulo || !novoEvento.data_inicio) {
      alert("Preencha os campos obrigatórios (Título e Data de Início).");
      return;
    }
    
    try {
      if (editandoId) {
        await atualizarEvento(editandoId, novoEvento);
      } else {
        await criarEvento(novoEvento);
      }
      await carregarDados();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // NOVO: Fluxo de Exclusão usando o ConfirmModal
  const handleExcluirClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmarExclusao = async () => {
    try {
      await excluirEvento(confirmModal.id);
      await carregarDados();
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      alert(error.message);
    }
  };

  // NOVO: Função auxiliar para verificar se uma data está entre o início e fim de um evento
  const isDateInEventRange = (dateStr, dataInicio, dataFim) => {
    if (!dataInicio) return false;
    const start = dataInicio.split('T')[0];
    const end = dataFim ? dataFim.split('T')[0] : start;
    return dateStr >= start && dateStr <= end;
  };

  const selectedDateStr = formatToDateString(selectedDate);
  
  // ATUALIZADO: Filtra tarefas pelo dia exato, mas eventos pelo range (múltiplos dias)
  const tarefasDoDia = tarefas.filter(t => t.data_entrega && t.data_entrega.split('T')[0] === selectedDateStr);
  const eventosDoDia = eventos.filter(e => isDateInEventRange(selectedDateStr, e.data_inicio, e.data_fim));

  let daysInGrid = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  if (viewType === 'week') {
    const target = selectedDate.getMonth() === currentDate.getMonth() ? selectedDate : currentDate;
    const startOfWeek = new Date(target);
    startOfWeek.setDate(target.getDate() - target.getDay());
    daysInGrid = Array(7).fill(null).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const mesFormatado = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

  return (
    <div className="flex flex-col h-full gap-6 pb-8 w-full animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda & Planejamento</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize seus eventos e tarefas acadêmicas.</p>
        </div>
        <Button text="+ Novo Evento" onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
        
        {/* CALENDÁRIO */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{mesFormatado}</h2>
              <div className="flex gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                <button onClick={prevPeriod} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
                <button onClick={hoje} className="px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">Hoje</button>
                <button onClick={nextPeriod} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
              </div>
            </div>

            <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
              <button onClick={() => setViewType('month')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewType === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Mês</button>
              <button onClick={() => setViewType('week')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewType === 'week' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Semana</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{dia}</div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-2 flex-1 ${viewType === 'month' ? 'auto-rows-fr' : 'min-h-[150px]'}`}>
            {daysInGrid.map((dayObj, index) => {
              if (!dayObj) return <div key={`empty-${index}`} className="p-2 rounded-xl bg-gray-50/30 dark:bg-gray-800/30 border border-transparent"></div>;

              const dateStr = formatToDateString(dayObj);
              const isSelected = isSameDay(dateStr, formatToDateString(selectedDate));
              const isToday = isSameDay(dateStr, formatToDateString(new Date()));
              
              const dayTasks = tarefas.filter(t => t.data_entrega && t.data_entrega.split('T')[0] === dateStr);
              // ATUALIZADO: Bolinha azul aparece em todos os dias do range do evento
              const dayEvents = eventos.filter(e => isDateInEventRange(dateStr, e.data_inicio, e.data_fim));

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dayObj)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all min-h-[60px] lg:min-h-[80px]
                    ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700'}
                  `}
                >
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' : ''}`}>
                    {dayObj.getDate()}
                  </span>
                  
                  <div className="flex gap-1 mt-auto pb-1">
                    {dayEvents.length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400 dark:bg-blue-600' : 'bg-blue-500'}`}></span>}
                    {dayTasks.filter(t => t.status !== 'concluida').length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400 dark:bg-purple-600' : 'bg-purple-500'}`}></span>}
                    {dayTasks.filter(t => t.status === 'concluida').length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-400 dark:bg-green-600' : 'bg-green-500'}`}></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALHES DO DIA */}
        <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 flex flex-col h-full min-h-[500px] transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tarefas e Eventos do dia</p>

          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
            
            {tarefasDoDia.length === 0 && eventosDoDia.length === 0 && (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-medium">Nenhum compromisso para este dia.</div>
            )}

            {eventosDoDia.map(evento => {
              const disc = disciplinas.find(d => String(d.id) === String(evento.disciplina_id));
              
              // ATUALIZADO: Lógica de exibição de Duração
              const startStr = evento.data_inicio.split('T')[0];
              const endStr = evento.data_fim ? evento.data_fim.split('T')[0] : startStr;
              const horaInicio = new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              
              let displayTime = `${horaInicio} • Evento`;
              if (startStr !== endStr) {
                const endDateObj = new Date(evento.data_fim);
                const endFormatted = endDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                displayTime = `${horaInicio} • Até ${endFormatted}`;
              }

              return (
                <div key={`ev-${evento.id}`} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-l-4 border-l-blue-500 relative group transition-colors">
                  
                  {/* ATUALIZADO: Botões de Editar e Excluir */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button onClick={() => abrirModalEdicao(evento)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleExcluirClick(evento.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="text-xs font-bold text-blue-500 dark:text-blue-400 mb-1">{displayTime}</div>
                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight pr-14">{evento.titulo}</h4>
                  {disc && <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-2 block">{disc.nome}</span>}
                </div>
              );
            })}

            {tarefasDoDia.map(tarefa => {
              const isConcluida = tarefa.status === 'concluida';
              const disc = disciplinas.find(d => String(d.id) === String(tarefa.disciplina_id));
              return (
                <div key={`ta-${tarefa.id}`} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-l-4 transition-colors ${isConcluida ? 'border-l-green-500 opacity-60' : 'border-l-purple-500'}`}>
                  <div className={`text-xs font-bold mb-1 ${isConcluida ? 'text-green-500 dark:text-green-400' : 'text-purple-500 dark:text-purple-400'}`}>
                    {isConcluida ? '✔ Tarefa Concluída' : 'Prazo de Entrega'}
                  </div>
                  <h4 className={`font-bold leading-tight ${isConcluida ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{tarefa.titulo}</h4>
                  {disc && <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-2 block">{disc.nome}</span>}
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Evento" : "Agendar Novo Evento"}>
        <form onSubmit={handleSalvarEvento} className="flex flex-col gap-4">
          <Input id="titulo" label="Título do Evento *" placeholder="Ex: Feira de Ciências" value={novoEvento.titulo} onChange={e => setNovoEvento({...novoEvento, titulo: e.target.value})} />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-700 outline-none resize-none h-20" placeholder="Detalhes do evento..." value={novoEvento.descricao} onChange={e => setNovoEvento({...novoEvento, descricao: e.target.value})}></textarea>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina Relacionada (Opcional)</label>
            <select className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 border border-gray-200 dark:border-gray-700 outline-none" value={novoEvento.disciplina_id} onChange={e => setNovoEvento({...novoEvento, disciplina_id: e.target.value})}>
              <option value="">Nenhuma disciplina</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="data_inicio" label="Início *" type="datetime-local" value={novoEvento.data_inicio} onChange={e => setNovoEvento({...novoEvento, data_inicio: e.target.value})} />
            <Input id="data_fim" label="Fim" type="datetime-local" value={novoEvento.data_fim} onChange={e => setNovoEvento({...novoEvento, data_fim: e.target.value})} />
          </div>

          <Button type="submit" text={editandoId ? "Salvar Alterações" : "Agendar Evento"} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white border-none" />
        </form>
      </Modal>

      {/* NOVO: MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não poderá ser desfeita."
        confirmText="Excluir Evento"
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmarExclusao}
      />

    </div>
  );
};

export default Agenda;