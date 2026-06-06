import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { getDaysInMonth, formatToDateString, isSameDay } from '../utils/calendarUtils';

// Services
import { obterTarefas } from '../services/tarefas'; // Certifique-se de que no tarefas.js essa função já é async
import { obterEventos, criarEvento, excluirEvento } from '../services/eventosService';
import { obterDisciplinasAPI } from '../services/disciplinas'; // Usando a versão API

const Agenda = () => {
  const [tarefas, setTarefas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState('month');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEvento, setNovoEvento] = useState({ titulo: '', descricao: '', data_inicio: '', data_fim: '', disciplina_id: '' });

  // Transformado em ASYNC
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

  // Transformado em ASYNC
  const handleCriarEvento = async (e) => {
    e.preventDefault();
    if (!novoEvento.titulo || !novoEvento.data_inicio) {
      alert("Preencha os campos obrigatórios (Título e Data de Início).");
      return;
    }
    
    try {
      await criarEvento(novoEvento);
      await carregarDados();
      setIsModalOpen(false);
      setNovoEvento({ titulo: '', descricao: '', data_inicio: '', data_fim: '', disciplina_id: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  // Transformado em ASYNC
  const handleExcluirEvento = async (id) => {
    if (window.confirm("Deseja realmente excluir este evento?")) {
      try {
        await excluirEvento(id);
        await carregarDados();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const selectedDateStr = formatToDateString(selectedDate);
  
  // Ajuste para lidar com a data vinda do banco (que pode ter o 'T' no meio)
  const tarefasDoDia = tarefas.filter(t => t.data_entrega && t.data_entrega.split('T')[0] === selectedDateStr);
  const eventosDoDia = eventos.filter(e => e.data_inicio && e.data_inicio.split('T')[0] === selectedDateStr);

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
          <h1 className="text-2xl font-bold text-gray-900">Agenda & Planejamento</h1>
          <p className="text-sm text-gray-500 mt-1">Organize seus eventos e tarefas acadêmicas.</p>
        </div>
        <Button text="+ Novo Evento" onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
        
        <div className="w-full lg:w-2/3 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 capitalize">{mesFormatado}</h2>
              <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                <button onClick={prevPeriod} className="p-1.5 text-gray-500 hover:bg-white rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
                <button onClick={hoje} className="px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-white rounded-md transition-colors">Hoje</button>
                <button onClick={nextPeriod} className="p-1.5 text-gray-500 hover:bg-white rounded-md transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
              </div>
            </div>

            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button onClick={() => setViewType('month')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewType === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Mês</button>
              <button onClick={() => setViewType('week')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewType === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Semana</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{dia}</div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-2 flex-1 ${viewType === 'month' ? 'auto-rows-fr' : 'min-h-[150px]'}`}>
            {daysInGrid.map((dayObj, index) => {
              if (!dayObj) return <div key={`empty-${index}`} className="p-2 rounded-xl bg-gray-50/30 border border-transparent"></div>;

              const dateStr = formatToDateString(dayObj);
              const isSelected = isSameDay(dateStr, formatToDateString(selectedDate));
              const isToday = isSameDay(dateStr, formatToDateString(new Date()));
              
              const dayTasks = tarefas.filter(t => t.data_entrega && t.data_entrega.split('T')[0] === dateStr);
              const dayEvents = eventos.filter(e => e.data_inicio && e.data_inicio.split('T')[0] === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dayObj)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all min-h-[60px] lg:min-h-[80px]
                    ${isSelected ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:border-purple-300 hover:bg-purple-50'}
                  `}
                >
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-purple-100 text-purple-700' : ''}`}>
                    {dayObj.getDate()}
                  </span>
                  
                  <div className="flex gap-1 mt-auto pb-1">
                    {dayEvents.length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-500'}`}></span>}
                    {dayTasks.filter(t => t.status !== 'concluida').length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-purple-500'}`}></span>}
                    {dayTasks.filter(t => t.status === 'concluida').length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-400' : 'bg-green-500'}`}></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded-[2rem] border border-gray-200 flex flex-col h-full min-h-[500px]">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
          </h3>
          <p className="text-sm text-gray-500 mb-6">Tarefas e Eventos do dia</p>

          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
            
            {tarefasDoDia.length === 0 && eventosDoDia.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-medium">Nenhum compromisso para este dia.</div>
            )}

            {eventosDoDia.map(evento => {
              const disc = disciplinas.find(d => d.id === evento.disciplina_id);
              const hora = new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={`ev-${evento.id}`} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-l-blue-500 relative group">
                  <button onClick={() => handleExcluirEvento(evento.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  <div className="text-xs font-bold text-blue-500 mb-1">{hora} • Evento</div>
                  <h4 className="font-bold text-gray-900 leading-tight">{evento.titulo}</h4>
                  {disc && <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">{disc.nome}</span>}
                </div>
              );
            })}

            {tarefasDoDia.map(tarefa => {
              const isConcluida = tarefa.status === 'concluida';
              const disc = disciplinas.find(d => d.id === tarefa.disciplina_id);
              return (
                <div key={`ta-${tarefa.id}`} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${isConcluida ? 'border-l-green-500 opacity-60' : 'border-l-purple-500'}`}>
                  <div className={`text-xs font-bold mb-1 ${isConcluida ? 'text-green-500' : 'text-purple-500'}`}>
                    {isConcluida ? '✔ Tarefa Concluída' : 'Prazo de Entrega'}
                  </div>
                  <h4 className={`font-bold leading-tight ${isConcluida ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{tarefa.titulo}</h4>
                  {disc && <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 block">{disc.nome}</span>}
                </div>
              );
            })}

          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Novo Evento">
        <form onSubmit={handleCriarEvento} className="flex flex-col gap-4">
          <Input id="titulo" label="Título do Evento *" placeholder="Ex: Feira de Ciências" value={novoEvento.titulo} onChange={e => setNovoEvento({...novoEvento, titulo: e.target.value})} />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 border border-gray-200 outline-none resize-none h-20" placeholder="Detalhes do evento..." value={novoEvento.descricao} onChange={e => setNovoEvento({...novoEvento, descricao: e.target.value})}></textarea>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">Disciplina Relacionada (Opcional)</label>
            <select className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 border border-gray-200 outline-none" value={novoEvento.disciplina_id} onChange={e => setNovoEvento({...novoEvento, disciplina_id: e.target.value})}>
              <option value="">Nenhuma disciplina</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="data_inicio" label="Início *" type="datetime-local" value={novoEvento.data_inicio} onChange={e => setNovoEvento({...novoEvento, data_inicio: e.target.value})} />
            <Input id="data_fim" label="Fim" type="datetime-local" value={novoEvento.data_fim} onChange={e => setNovoEvento({...novoEvento, data_fim: e.target.value})} />
          </div>

          <Button type="submit" text="Agendar Evento" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white border-none" />
        </form>
      </Modal>

    </div>
  );
};

export default Agenda;