import React, { useState, useEffect } from 'react';
import { obterTarefas } from '../services/tarefas'; 
import { obterDisciplinasAPI } from '../services/disciplinas';
import { obterEventos } from '../services/eventosService'; // NOVO
import { criarNotificacao } from '../services/notificacoes'; // NOVO

const Dashboard = () => {
  const [tarefas, setTarefas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [tarefasData, disciplinasData, eventosData] = await Promise.all([
          obterTarefas(),
          obterDisciplinasAPI(),
          obterEventos() // NOVO: Busca os eventos para a inteligência
        ]);
        
        setTarefas(tarefasData);
        setDisciplinas(disciplinasData);

        // ==========================================
        // INTELIGÊNCIA DE NOTIFICAÇÕES AUTOMÁTICAS
        // ==========================================
        const hojeStr = new Date().toISOString().split('T')[0];
        const ultimaVerificacao = localStorage.getItem('ultima_verificacao_notificacoes');

        // Só roda 1x por dia para não floodar o banco
        if (ultimaVerificacao !== hojeStr) {
          
          // 1. Verifica Tarefas Atrasadas
          const atrasadas = tarefasData.filter(t => t.status !== 'concluida' && t.data_entrega && t.data_entrega.split('T')[0] < hojeStr);
          if (atrasadas.length > 0) {
            await criarNotificacao("Tarefas Atrasadas", `Você tem ${atrasadas.length} tarefa(s) pendente(s) que já passaram do prazo!`);
          }

          // 2. Verifica Eventos Hoje
          const eventosHoje = eventosData.filter(e => e.data_inicio && e.data_inicio.split('T')[0] === hojeStr);
          for (const ev of eventosHoje) {
            await criarNotificacao("Evento Hoje", `Você tem um compromisso marcado para hoje: ${ev.titulo}`);
          }

          localStorage.setItem('ultima_verificacao_notificacoes', hojeStr);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }
    };

    carregarDados();
  }, []);

  const totalTarefas = tarefas.length;
  const pendentes = tarefas.filter(t => t.status === 'pendente').length;
  const emAndamento = tarefas.filter(t => t.status === 'em_andamento').length;
  const concluidas = tarefas.filter(t => t.status === 'concluida').length;

  const metricas = [
    { titulo: 'Total de Tarefas', valor: totalTarefas, destaque: true, icone: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { titulo: 'Tarefas Pendentes', valor: pendentes, destaque: false, icone: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { titulo: 'Em Andamento', valor: emAndamento, destaque: false, icone: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { titulo: 'Tarefas Concluídas', valor: concluidas, destaque: false, icone: 'M5 13l4 4L19 7' }
  ];

  const dataHojeObj = new Date();
  dataHojeObj.setHours(0, 0, 0, 0);

  const tarefasNaoConcluidas = tarefas
    .filter(t => t.status !== 'concluida' && t.data_entrega)
    .sort((a, b) => new Date(`${a.data_entrega.split('T')[0]}T12:00:00`) - new Date(`${b.data_entrega.split('T')[0]}T12:00:00`));

  const agendaDinamica = tarefasNaoConcluidas.slice(0, 4).map(tarefa => {
    const tDate = new Date(`${tarefa.data_entrega.split('T')[0]}T12:00:00`);
    tDate.setHours(0, 0, 0, 0);

    const disciplina = disciplinas.find(d => String(d.id) === String(tarefa.disciplina_id));
    const dataFormatada = tDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    let statusAviso = '';
    let corBadge = '';

    if (tDate < dataHojeObj) {
      statusAviso = 'Atrasada';
      corBadge = 'bg-red-100 text-red-600';
    } else if (tDate.getTime() === dataHojeObj.getTime()) {
      statusAviso = 'Hoje';
      corBadge = 'bg-orange-100 text-orange-600';
    } else {
      statusAviso = 'Próxima';
      corBadge = 'bg-blue-100 text-blue-600';
    }

    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      disciplinaNome: disciplina ? disciplina.nome : 'Geral',
      dataFormatada,
      statusAviso,
      corBadge
    };
  });

  const tarefasAtrasadasCount = tarefasNaoConcluidas.filter(t => {
    const d = new Date(`${t.data_entrega.split('T')[0]}T12:00:00`);
    d.setHours(0,0,0,0);
    return d < dataHojeObj;
  }).length;

  const iaTitulo = tarefasAtrasadasCount > 0 ? "Atenção aos prazos!" : "Tudo em dia!";
  const iaTexto = tarefasAtrasadasCount > 0 
    ? `Você tem ${tarefasAtrasadasCount} tarefa(s) atrasada(s). Sugiro focar nelas agora para não acumular matéria.` 
    : "Ótimo trabalho! Você não tem tarefas atrasadas. Que tal revisar seus flashcards para fixar o conteúdo?";

  const graficoSemana = [
    { dia: 'Seg', horas: 2, percent: '40%' },
    { dia: 'Ter', horas: 4, percent: '80%' },
    { dia: 'Qua', horas: 3, percent: '60%' },
    { dia: 'Qui', horas: 5, percent: '100%' },
    { dia: 'Sex', horas: 1, percent: '20%' },
    { dia: 'Sáb', horas: 2, percent: '40%' },
    { dia: 'Dom', horas: 0, percent: '5%' },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((item, index) => (
          <div key={index} className={`p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm border transition-all hover:shadow-md ${item.destaque ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${item.destaque ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{item.titulo}</span>
              <div className={`p-2 rounded-xl ${item.destaque ? 'bg-gray-800 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icone} /></svg>
              </div>
            </div>
            <div className="text-4xl font-bold animate-pulse-once">{item.valor}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Horas de Estudo</h2>
              <select className="bg-gray-50 dark:bg-gray-900 border-none text-sm text-gray-500 dark:text-gray-400 rounded-lg py-1.5 px-3 outline-none cursor-pointer"><option>Esta Semana</option></select>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-2 mt-auto">
              {graficoSemana.map((dia) => (
                <div key={dia.dia} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-end justify-center h-full relative overflow-hidden">
                    <div className="w-full bg-purple-500 rounded-xl transition-all duration-500 group-hover:bg-purple-600" style={{ height: dia.percent }}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{dia.dia}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] shadow-sm text-white flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden gap-4 transition-colors duration-500 ${tarefasAtrasadasCount > 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
            <svg className="absolute right-0 top-0 w-32 h-32 text-white opacity-10 transform translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A120.138 120.138 0 0013.989 0A119.908 119.908 0 0115.97 20.54a119.908 119.908 0 00-2.616 12.02A119.933 119.933 0 011.046 11.3c2.56.46 5.152.793 7.784 1.011A119.82 119.82 0 0111.3 1.046z" clipRule="evenodd" /></svg>
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">EduAcess AI</span>
              </div>
              <h3 className="text-xl font-bold">{iaTitulo}</h3>
              <p className="text-white/90 text-sm max-w-md">{iaTexto}</p>
            </div>
            <button className={`relative z-10 bg-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform whitespace-nowrap ${tarefasAtrasadasCount > 0 ? 'text-red-600' : 'text-purple-600'}`}>
              {tarefasAtrasadasCount > 0 ? 'Ver Tarefas' : 'Iniciar Revisão'}
            </button>
          </div>

        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agenda</h2>
            <span className="text-sm text-gray-400 font-medium">Próximas ações</span>
          </div>

          <div className="flex flex-col gap-4">
            {agendaDinamica.length > 0 ? (
              agendaDinamica.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                  <div className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${item.corBadge}`}>{item.statusAviso}</div>
                  <div className="flex flex-col w-full overflow-hidden">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{item.titulo}</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.disciplinaNome}</span>
                      <span className="text-[10px] text-gray-400">{item.dataFormatada}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-400">
                <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-medium">Sua agenda está livre!</p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="bg-[#F4F7FE] dark:bg-gray-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-blue-50 dark:border-gray-800">
              <svg className="w-8 h-8 text-blue-300 dark:text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conecte seu Google Calendar para organizar sua semana.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;