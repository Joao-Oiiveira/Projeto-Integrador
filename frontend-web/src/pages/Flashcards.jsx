import React, { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { obterDisciplinasAPI } from '../services/disciplinas';
import { 
  obterBaralhos, criarBaralho, atualizarBaralho, excluirBaralho,
  obterTodosFlashcards, criarFlashcard, atualizarFlashcard, excluirFlashcard,
  registrarResultadoEstudo, gerarFlashcardsIA
} from '../services/flashcards';

const Flashcards = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [baralhos, setBaralhos] = useState([]);
  const [todosFlashcards, setTodosFlashcards] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, tipo: '' });
  
  const [baralhoSelecionado, setBaralhoSelecionado] = useState(null);
  const [flashcardsAtuais, setFlashcardsAtuais] = useState([]);

  // Estados do Modo de Estudo
  const [modoEstudo, setModoEstudo] = useState(false);
  const [cardsEmbaralhados, setCardsEmbaralhados] = useState([]);
  const [indiceEstudo, setIndiceEstudo] = useState(0);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [resultadoSessao, setResultadoSessao] = useState({ acertos: 0, erros: 0 });
  const [sessaoFinalizada, setSessaoFinalizada] = useState(false);

  // Estados dos Modais
  const [modalBaralhoOpen, setModalBaralhoOpen] = useState(false);
  const [modalFlashcardOpen, setModalFlashcardOpen] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Estados dos Formulários
  const [formBaralho, setFormBaralho] = useState({ nome: '', disciplina_id: '' });
  const [formFlashcard, setFormFlashcard] = useState({ pergunta: '', resposta: '' });
  const [formIA, setFormIA] = useState({ tema: '', dificuldade: 'médio', quantidade: 5 });
  const [loadingIA, setLoadingIA] = useState(false);

  const carregarDados = async () => {
    try {
      const [discData, barData, flashData] = await Promise.all([
        obterDisciplinasAPI(),
        obterBaralhos(),
        obterTodosFlashcards()
      ]);
      setDisciplinas(discData);
      setBaralhos(barData);
      setTodosFlashcards(flashData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (baralhoSelecionado && !modoEstudo) {
      setFlashcardsAtuais(todosFlashcards.filter(f => f.baralho_id === baralhoSelecionado.id));
    }
  }, [baralhoSelecionado, todosFlashcards, modoEstudo]);

  // ==========================================
  // LÓGICA DE REPETIÇÃO ESPAÇADA E ESTUDO
  // ==========================================
  const getCartasParaRevisar = (cartas) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return cartas.filter(c => {
      if (!c.proxima_revisao) return true;
      const dataRev = new Date(c.proxima_revisao);
      dataRev.setHours(0, 0, 0, 0);
      return dataRev <= hoje;
    });
  };

  const iniciarEstudo = (baralhoTarget, flashcardsDoBaralho) => {
    if (flashcardsDoBaralho.length === 0) {
      alert("Nenhuma carta disponível para este modo de estudo.");
      return;
    }
    setBaralhoSelecionado(baralhoTarget);
    const shuffled = [...flashcardsDoBaralho].sort(() => Math.random() - 0.5);
    setCardsEmbaralhados(shuffled);
    setIndiceEstudo(0);
    setMostrarResposta(false);
    setResultadoSessao({ acertos: 0, erros: 0 });
    setSessaoFinalizada(false);
    setModoEstudo(true);
  };

  const handleRespostaEstudo = async (acertou) => {
    const cardAtual = cardsEmbaralhados[indiceEstudo];
    try {
      await registrarResultadoEstudo(cardAtual.id, acertou);
      setResultadoSessao(prev => ({
        acertos: prev.acertos + (acertou ? 1 : 0),
        erros: prev.erros + (acertou ? 0 : 1)
      }));
      if (indiceEstudo + 1 < cardsEmbaralhados.length) {
        setMostrarResposta(false);
        setIndiceEstudo(prev => prev + 1);
      } else {
        setSessaoFinalizada(true);
      }
    } catch (error) {
      console.error("Erro ao salvar progresso.", error);
    }
  };

  const sairEstudo = () => {
    setModoEstudo(false);
    setSessaoFinalizada(false);
    setBaralhoSelecionado(null);
    carregarDados();
  };

  // ==========================================
  // LÓGICA DE TTS (LEITURA DE VOZ ISOLADA)
  // ==========================================
  const lerTexto = (texto) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // LÓGICA DE GERAÇÃO VIA IA
  // ==========================================
  const handleGerarIA = async (e) => {
    e.preventDefault();
    if (!formIA.tema.trim()) { alert("Por favor, informe um tema para a IA."); return; }
    
    setLoadingIA(true);
    try {
      await gerarFlashcardsIA(baralhoSelecionado.id, formIA.tema, formIA.dificuldade, formIA.quantidade);
      await carregarDados();
      setModalIAOpen(false);
      setFormIA({ tema: '', dificuldade: 'médio', quantidade: 5 });
    } catch (error) {
      alert(error.message || "Erro ao gerar cartas.");
    } finally {
      setLoadingIA(false);
    }
  };

  // ==========================================
  // FUNÇÕES CRUD
  // ==========================================
  const abrirModalNovoBaralho = () => {
    if (disciplinas.length === 0) { alert("Crie uma Disciplina primeiro!"); return; }
    setEditandoId(null); setFormBaralho({ nome: '', disciplina_id: '' }); setModalBaralhoOpen(true);
  };
  const abrirModalEditarBaralho = (e, baralho) => {
    e.stopPropagation(); setEditandoId(baralho.id); setFormBaralho({ nome: baralho.nome, disciplina_id: baralho.disciplina_id || '' }); setModalBaralhoOpen(true);
  };
  const salvarBaralho = async (e) => {
    e.preventDefault();
    if (!formBaralho.nome || !formBaralho.disciplina_id) { alert("Preencha todos os campos."); return; }
    try {
      if (editandoId) await atualizarBaralho(editandoId, formBaralho); 
      else await criarBaralho(formBaralho);
      await carregarDados(); 
      setModalBaralhoOpen(false);
    } catch (error) { alert(error.message); }
  };
  const apagarBaralho = (e, id) => {
    e.stopPropagation(); 
    setConfirmModal({ isOpen: true, id: id, tipo: 'baralho' });
  };
  const abrirModalNovoFlashcard = () => { 
    setEditandoId(null); setFormFlashcard({ pergunta: '', resposta: '' }); setModalFlashcardOpen(true); 
  };
  const abrirModalEditarFlashcard = (flashcard) => { 
    setEditandoId(flashcard.id); setFormFlashcard({ pergunta: flashcard.pergunta, resposta: flashcard.resposta }); setModalFlashcardOpen(true); 
  };
  const salvarFlashcard = async (e) => {
    e.preventDefault();
    if (!formFlashcard.pergunta || !formFlashcard.resposta) { alert("Preencha pergunta e resposta."); return; }
    try {
      if (editandoId) await atualizarFlashcard(editandoId, formFlashcard); 
      else await criarFlashcard({ ...formFlashcard, baralho_id: baralhoSelecionado.id });
      await carregarDados(); 
      setModalFlashcardOpen(false);
    } catch (error) { alert(error.message); }
  };
  const apagarFlashcard = (id) => { 
    setConfirmModal({ isOpen: true, id: id, tipo: 'flashcard' });
  };

  const confirmarExclusao = async () => {
    try {
      if (confirmModal.tipo === 'baralho') {
        await excluirBaralho(confirmModal.id);
      } else if (confirmModal.tipo === 'flashcard') {
        await excluirFlashcard(confirmModal.id);
      }
      await carregarDados(); 
      setConfirmModal({ isOpen: false, id: null, tipo: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  // ==========================================
  // TELA 3: MODO DE ESTUDO
  // ==========================================
  if (modoEstudo) {
    return (
      <div className="flex flex-col h-full animate-fade-in w-full max-w-3xl mx-auto py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={sairEstudo} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-sm flex items-center gap-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Sair do Estudo
          </button>
          {!sessaoFinalizada && (
            <span className="bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
              {indiceEstudo + 1} / {cardsEmbaralhados.length}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">
          {sessaoFinalizada ? (
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sessão Concluída!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Aqui está o seu desempenho no baralho <strong className="text-gray-700 dark:text-gray-300">{baralhoSelecionado.nome}</strong>.</p>
              
              <div className="flex gap-6 mb-10 w-full justify-center">
                <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase">Acertos</span>
                  <span className="text-3xl font-bold text-green-700 dark:text-green-300">{resultadoSessao.acertos}</span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase">Erros</span>
                  <span className="text-3xl font-bold text-red-700 dark:text-red-300">{resultadoSessao.erros}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button text="Voltar aos Baralhos" onClick={sairEstudo} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border-none shadow-none" />
              </div>
            </div>
          ) : (
            <div key={indiceEstudo} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col min-h-[400px] md:min-h-[500px] animate-fade-in-up w-full overflow-hidden relative">
              
              {/* Pergunta */}
              <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center relative">
                <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-400 uppercase tracking-widest">Pergunta</span>
                
                <button onClick={() => lerTexto(cardsEmbaralhados[indiceEstudo].pergunta)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-gray-50 dark:bg-gray-700 rounded-full transition-colors" title="Ouvir Pergunta">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </button>

                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-snug break-words w-full">
                  {cardsEmbaralhados[indiceEstudo].pergunta}
                </h3>
              </div>

              {mostrarResposta && <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>}

              {/* Resposta */}
              {mostrarResposta ? (
                <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 p-8 md:p-12 flex flex-col items-center justify-center text-center relative animate-fade-in">
                  <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-purple-400 uppercase tracking-widest">Resposta</span>
                  
                  <button onClick={() => lerTexto(cardsEmbaralhados[indiceEstudo].resposta)} className="absolute top-6 right-6 p-2 text-purple-400 hover:text-purple-600 bg-purple-50 dark:bg-purple-900/30 rounded-full transition-colors" title="Ouvir Resposta">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>

                  <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-snug break-words w-full">
                    {cardsEmbaralhados[indiceEstudo].resposta}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 flex justify-center border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => setMostrarResposta(true)} className="w-full md:w-auto px-8 py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform">
                    Revelar Resposta
                  </button>
                </div>
              )}

              {/* Botões de Ação */}
              {mostrarResposta && (
                <div className="p-4 md:p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-4 animate-fade-in">
                  <button onClick={() => handleRespostaEstudo(false)} className="flex-1 py-4 md:py-5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-2xl font-bold text-lg transition-colors border border-red-200 dark:border-red-800 shadow-sm">Errei</button>
                  <button onClick={() => handleRespostaEstudo(true)} className="flex-1 py-4 md:py-5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-2xl font-bold text-lg transition-colors border border-green-200 dark:border-green-800 shadow-sm">Acertei</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: VISÃO DE CARTAS (GERENCIAMENTO)
  // ==========================================
  if (baralhoSelecionado && !modoEstudo) {
    const disciplinaDoBaralho = disciplinas.find(d => String(d.id) === String(baralhoSelecionado.disciplina_id));
    
    return (
      <>
        <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col gap-1">
              <button onClick={() => setBaralhoSelecionado(null)} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar aos Baralhos
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-3">
                {baralhoSelecionado.nome}
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg ${disciplinaDoBaralho?.cor || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {disciplinaDoBaralho?.nome || 'Geral'}
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setModalIAOpen(true)} 
                className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md whitespace-nowrap transition-all transform hover:scale-105" 
              >
                ✨ Gerar com IA
              </button>
              
              {/* BOTÃO CORRIGIDO: Retornou para o roxo padrão */}
              <Button 
                text="+ Nova Carta" 
                onClick={abrirModalNovoFlashcard} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" 
              />
            </div>
          </div>

          {flashcardsAtuais.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Seu baralho está vazio</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Crie sua primeira carta ou use a IA para gerar conteúdo automaticamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardsAtuais.map(card => (
                <div key={card.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 relative group">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalEditarFlashcard(card)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => apagarFlashcard(card.id)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                  <div className="flex flex-col gap-1 pr-16">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pergunta</span>
                    <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base leading-snug">{card.pergunta}</p>
                  </div>
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Resposta</span>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-snug line-clamp-3">{card.resposta}</p>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-bold">
                    {(card.acertos === 0 && card.erros === 0) || (card.acertos === undefined && card.erros === undefined) ? (
                      <span className="text-gray-400 dark:text-gray-500">Nunca revisada</span>
                    ) : (
                      <div className="flex gap-3">
                        <span className="text-green-600 dark:text-green-400">Acertos: {card.acertos || 0}</span>
                        <span className="text-red-600 dark:text-red-400">Erros: {card.erros || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAIS INSERIDOS AQUI PARA FUNCIONAREM NA TELA 2 */}
        <Modal isOpen={modalIAOpen} onClose={() => setModalIAOpen(false)} title="Gerar Flashcards com IA">
          <form onSubmit={handleGerarIA} className="flex flex-col gap-4">
            <Input id="tema_ia" label="Tema Específico *" placeholder="Ex: Revolução Francesa" value={formIA.tema} onChange={e => setFormIA({...formIA, tema: e.target.value})} />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dificuldade</label>
              <select className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none" value={formIA.dificuldade} onChange={e => setFormIA({...formIA, dificuldade: e.target.value})}>
                <option value="fácil">Fácil</option>
                <option value="médio">Médio</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade</label>
              <select className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none" value={formIA.quantidade} onChange={e => setFormIA({...formIA, quantidade: e.target.value})}>
                <option value={5}>5 Cartas</option>
                <option value={10}>10 Cartas</option>
                <option value={15}>15 Cartas</option>
                <option value={20}>20 Cartas</option>
              </select>
            </div>
            <Button type="submit" text={loadingIA ? "Gerando..." : "Gerar Cartas ✨"} disabled={loadingIA} className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none" />
          </form>
        </Modal>

        <Modal isOpen={modalFlashcardOpen} onClose={() => setModalFlashcardOpen(false)} title={editandoId ? "Editar Carta" : "Nova Carta"}>
          <form onSubmit={salvarFlashcard} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frente (Pergunta) *</label>
              <textarea className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none resize-none h-20" placeholder="Ex: O que é a mitocôndria?" value={formFlashcard.pergunta} onChange={e => setFormFlashcard({...formFlashcard, pergunta: e.target.value})}></textarea>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Verso (Resposta) *</label>
              <textarea className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none resize-none h-24" placeholder="Ex: É a organela responsável pela respiração celular." value={formFlashcard.resposta} onChange={e => setFormFlashcard({...formFlashcard, resposta: e.target.value})}></textarea>
            </div>
            <Button type="submit" text={editandoId ? "Salvar" : "Criar Carta"} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white border-none" />
          </form>
        </Modal>

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.tipo === 'baralho' ? "Excluir Baralho" : "Excluir Flashcard"}
          message={
            confirmModal.tipo === 'baralho' 
              ? "Excluir este baralho apagará TODOS os flashcards dele. Tem certeza?" 
              : "Deseja realmente excluir este flashcard? Esta ação não poderá ser desfeita."
          }
          confirmText="Excluir"
          onCancel={() => setConfirmModal({ isOpen: false, id: null, tipo: '' })}
          onConfirm={confirmarExclusao}
        />
      </>
    );
  }

  // ==========================================
  // TELA 1: VISÃO DE BARALHOS (MASTER)
  // ==========================================
  return (
    <>
      <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Baralhos</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organize seus flashcards por disciplina.</p>
          </div>
          <Button text="+ Novo Baralho" onClick={abrirModalNovoBaralho} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" />
        </div>

        {baralhos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum baralho criado</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Crie um baralho e agrupe flashcards para memorizar seus conteúdos.</p>
            <Button text="Criar Primeiro Baralho" onClick={abrirModalNovoBaralho} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-none shadow-none hover:bg-purple-200 dark:hover:bg-purple-900/50" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {baralhos.map(baralho => {
              const disciplina = disciplinas.find(d => String(d.id) === String(baralho.disciplina_id));
              const cardsDoBaralho = todosFlashcards.filter(f => f.baralho_id === baralho.id);
              const totalCartas = cardsDoBaralho.length;
              
              const cartasParaRevisar = getCartasParaRevisar(cardsDoBaralho);

              return (
                <div key={baralho.id} onClick={() => setBaralhoSelecionado(baralho)} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-500 transition-all cursor-pointer flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase ${disciplina?.cor || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {disciplina?.nome || 'Geral'}
                    </div>
                    
                    <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => abrirModalEditarBaralho(e, baralho)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={(e) => apagarBaralho(e, baralho.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{baralho.nome}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      {totalCartas} {totalCartas === 1 ? 'carta' : 'cartas'} no total
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                    {cartasParaRevisar.length > 0 ? (
                      <button onClick={(e) => { e.stopPropagation(); iniciarEstudo(baralho, cartasParaRevisar); }} className="w-full py-2.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-xl font-bold text-sm transition-all">
                        Revisar Hoje ({cartasParaRevisar.length})
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed">
                        Tudo em dia! 🎉
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); iniciarEstudo(baralho, cardsDoBaralho); }} className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-xs transition-all">
                      Estudo Livre (Todas as {totalCartas})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modalBaralhoOpen} onClose={() => setModalBaralhoOpen(false)} title={editandoId ? "Editar Baralho" : "Novo Baralho"}>
        <form onSubmit={salvarBaralho} className="flex flex-col gap-4">
          <Input id="nome" label="Nome do Baralho *" placeholder="Ex: Fórmulas de Física" value={formBaralho.nome} onChange={e => setFormBaralho({...formBaralho, nome: e.target.value})} />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Disciplina *</label>
            <select className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none" value={formBaralho.disciplina_id} onChange={e => setFormBaralho({...formBaralho, disciplina_id: e.target.value})}>
              <option value="">Selecione a disciplina...</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
          <Button type="submit" text={editandoId ? "Salvar" : "Criar Baralho"} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white border-none" />
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.tipo === 'baralho' ? "Excluir Baralho" : "Excluir Flashcard"}
        message={
          confirmModal.tipo === 'baralho' 
            ? "Excluir este baralho apagará TODOS os flashcards dele. Tem certeza?" 
            : "Deseja realmente excluir este flashcard? Esta ação não poderá ser desfeita."
        }
        confirmText="Excluir"
        onCancel={() => setConfirmModal({ isOpen: false, id: null, tipo: '' })}
        onConfirm={confirmarExclusao}
      />
    </>
  );
};

export default Flashcards;