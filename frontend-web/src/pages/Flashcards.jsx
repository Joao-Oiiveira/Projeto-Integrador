import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { obterDisciplinasAPI } from '../services/disciplinas'; // <-- IMPORTAÇÃO CORRIGIDA
import { 
  obterBaralhos, criarBaralho, atualizarBaralho, excluirBaralho,
  obterTodosFlashcards, criarFlashcard, atualizarFlashcard, excluirFlashcard,
  registrarResultadoEstudo
} from '../services/flashcards';

const Flashcards = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [baralhos, setBaralhos] = useState([]);
  const [todosFlashcards, setTodosFlashcards] = useState([]);
  
  const [baralhoSelecionado, setBaralhoSelecionado] = useState(null);
  const [flashcardsAtuais, setFlashcardsAtuais] = useState([]);

  const [modoEstudo, setModoEstudo] = useState(false);
  const [cardsEmbaralhados, setCardsEmbaralhados] = useState([]);
  const [indiceEstudo, setIndiceEstudo] = useState(0);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [resultadoSessao, setResultadoSessao] = useState({ acertos: 0, erros: 0 });
  const [sessaoFinalizada, setSessaoFinalizada] = useState(false);

  const [modalBaralhoOpen, setModalBaralhoOpen] = useState(false);
  const [modalFlashcardOpen, setModalFlashcardOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [formBaralho, setFormBaralho] = useState({ nome: '', disciplina_id: '' });
  const [formFlashcard, setFormFlashcard] = useState({ pergunta: '', resposta: '' });

  // Transformado em ASYNC
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

  // Filtra as cartas do baralho selecionado localmente (síncrono)
  useEffect(() => {
    if (baralhoSelecionado && !modoEstudo) {
      setFlashcardsAtuais(todosFlashcards.filter(f => f.baralho_id === baralhoSelecionado.id));
    }
  }, [baralhoSelecionado, todosFlashcards, modoEstudo]);

  const iniciarEstudo = (baralhoTarget, flashcardsDoBaralho) => {
    if (flashcardsDoBaralho.length === 0) {
      alert("Adicione cartas a este baralho para começar a estudar!");
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

  // Transformado em ASYNC para salvar o progresso no banco
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
      alert("Erro ao salvar progresso.");
    }
  };

  const sairEstudo = () => {
    setModoEstudo(false);
    setSessaoFinalizada(false);
    setBaralhoSelecionado(null);
  };

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
  
  const apagarBaralho = async (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Excluir este baralho apagará TODOS os flashcards dele. Tem certeza?")) { 
      try { await excluirBaralho(id); await carregarDados(); } catch (error) { alert(error.message); }
    }
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
  
  const apagarFlashcard = async (id) => { 
    if (window.confirm("Deseja excluir este flashcard?")) { 
      try { await excluirFlashcard(id); await carregarDados(); } catch (error) { alert(error.message); }
    } 
  };

  if (modoEstudo) {
    return (
      <div className="flex flex-col h-full animate-fade-in w-full max-w-3xl mx-auto py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={sairEstudo} className="text-gray-400 hover:text-gray-700 font-bold text-sm flex items-center gap-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Sair do Estudo
          </button>
          {!sessaoFinalizada && (
            <span className="bg-white px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-500 border border-gray-100">
              {indiceEstudo + 1} / {cardsEmbaralhados.length}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">
          {sessaoFinalizada ? (
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sessão Concluída!</h2>
              <p className="text-gray-500 mb-8">Aqui está o seu desempenho no baralho <strong className="text-gray-700">{baralhoSelecionado.nome}</strong>.</p>
              
              <div className="flex gap-6 mb-10 w-full justify-center">
                <div className="bg-green-50 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                  <span className="text-sm font-bold text-green-600 uppercase">Acertos</span>
                  <span className="text-3xl font-bold text-green-700">{resultadoSessao.acertos}</span>
                </div>
                <div className="bg-red-50 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                  <span className="text-sm font-bold text-red-600 uppercase">Erros</span>
                  <span className="text-3xl font-bold text-red-700">{resultadoSessao.erros}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button text="Voltar aos Baralhos" onClick={sairEstudo} className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none shadow-none" />
                <Button text="Estudar Novamente" onClick={() => iniciarEstudo(baralhoSelecionado, cardsEmbaralhados)} className="bg-purple-600 text-white hover:bg-purple-700 border-none" />
              </div>
            </div>
          ) : (
            <div key={indiceEstudo} className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col min-h-[400px] md:min-h-[500px] animate-fade-in-up w-full overflow-hidden">
              <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center relative">
                <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-400 tracking-widest uppercase">Pergunta</span>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug break-words w-full">
                  {cardsEmbaralhados[indiceEstudo].pergunta}
                </h3>
              </div>
              {mostrarResposta && <div className="w-full h-px bg-gray-100"></div>}
              {mostrarResposta ? (
                <div className="flex-1 bg-gray-50/50 p-8 md:p-12 flex flex-col items-center justify-center text-center relative animate-fade-in">
                  <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-purple-400 tracking-widest uppercase">Resposta</span>
                  <p className="text-xl md:text-2xl font-medium text-gray-700 leading-snug break-words w-full">
                    {cardsEmbaralhados[indiceEstudo].resposta}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 flex justify-center border-t border-gray-100">
                  <button onClick={() => setMostrarResposta(true)} className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform">
                    Revelar Resposta
                  </button>
                </div>
              )}
              {mostrarResposta && (
                <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex gap-4 animate-fade-in">
                  <button onClick={() => handleRespostaEstudo(false)} className="flex-1 py-4 md:py-5 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold text-lg transition-colors border border-red-200 shadow-sm">Errei</button>
                  <button onClick={() => handleRespostaEstudo(true)} className="flex-1 py-4 md:py-5 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold text-lg transition-colors border border-green-200 shadow-sm">Acertei</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (baralhoSelecionado && !modoEstudo) {
    const disciplinaDoBaralho = disciplinas.find(d => String(d.id) === String(baralhoSelecionado.disciplina_id));
    
    return (
      <>
        <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col gap-1">
              <button onClick={() => setBaralhoSelecionado(null)} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Voltar aos Baralhos
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
                {baralhoSelecionado.nome}
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg ${disciplinaDoBaralho?.cor || 'bg-gray-100 text-gray-600'}`}>
                  {disciplinaDoBaralho?.nome || 'Geral'}
                </span>
              </h1>
            </div>
            <Button text="+ Nova Carta" onClick={abrirModalNovoFlashcard} className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-sm whitespace-nowrap" />
          </div>

          {flashcardsAtuais.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Seu baralho está vazio</h3>
              <p className="text-gray-500 mb-6">Crie sua primeira carta clicando no botão acima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardsAtuais.map(card => (
                <div key={card.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative group">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalEditarFlashcard(card)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => apagarFlashcard(card.id)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                  <div className="flex flex-col gap-1 pr-16">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pergunta</span>
                    <p className="font-bold text-gray-900 text-sm md:text-base leading-snug">{card.pergunta}</p>
                  </div>
                  <div className="w-full h-px bg-gray-100"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Resposta</span>
                    <p className="text-gray-600 text-sm md:text-base leading-snug">{card.resposta}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal isOpen={modalFlashcardOpen} onClose={() => setModalFlashcardOpen(false)} title={editandoId ? "Editar Carta" : "Nova Carta"}>
          <form onSubmit={salvarFlashcard} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">Frente (Pergunta) *</label>
              <textarea className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 outline-none resize-none h-20" placeholder="Ex: O que é a mitocôndria?" value={formFlashcard.pergunta} onChange={e => setFormFlashcard({...formFlashcard, pergunta: e.target.value})}></textarea>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-gray-700">Verso (Resposta) *</label>
              <textarea className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 outline-none resize-none h-24" placeholder="Ex: É a organela responsável pela respiração celular." value={formFlashcard.resposta} onChange={e => setFormFlashcard({...formFlashcard, resposta: e.target.value})}></textarea>
            </div>
            <Button type="submit" text={editandoId ? "Salvar" : "Criar Carta"} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white border-none" />
          </form>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Baralhos</h1>
            <p className="text-gray-500 text-sm mt-1">Organize seus flashcards por disciplina.</p>
          </div>
          <Button text="+ Novo Baralho" onClick={abrirModalNovoBaralho} className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-sm whitespace-nowrap" />
        </div>

        {baralhos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum baralho criado</h3>
            <p className="text-gray-500 max-w-sm mb-6">Crie um baralho e agrupe flashcards para memorizar seus conteúdos.</p>
            <Button text="Criar Primeiro Baralho" onClick={abrirModalNovoBaralho} className="bg-purple-100 text-purple-700 border-none shadow-none hover:bg-purple-200" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {baralhos.map(baralho => {
              const disciplina = disciplinas.find(d => String(d.id) === String(baralho.disciplina_id));
              const cardsDoBaralho = todosFlashcards.filter(f => f.baralho_id === baralho.id);
              const totalCartas = cardsDoBaralho.length;

              return (
                <div key={baralho.id} onClick={() => setBaralhoSelecionado(baralho)} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase ${disciplina?.cor || 'bg-gray-100 text-gray-600'}`}>
                      {disciplina?.nome || 'Geral'}
                    </div>
                    
                    <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => abrirModalEditarBaralho(e, baralho)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={(e) => apagarBaralho(e, baralho.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{baralho.nome}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-gray-400">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      {totalCartas} {totalCartas === 1 ? 'carta' : 'cartas'}
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <button onClick={(e) => { e.stopPropagation(); iniciarEstudo(baralho, cardsDoBaralho); }} className="w-full py-2.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-bold text-sm transition-all opacity-100 lg:opacity-0 group-hover:opacity-100">
                      Estudar Baralho
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
            <label className="text-sm font-medium text-gray-700">Disciplina *</label>
            <select className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 border border-gray-200 outline-none" value={formBaralho.disciplina_id} onChange={e => setFormBaralho({...formBaralho, disciplina_id: e.target.value})}>
              <option value="">Selecione a disciplina...</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
          <Button type="submit" text={editandoId ? "Salvar" : "Criar Baralho"} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white border-none" />
        </form>
      </Modal>
    </>
  );
};

export default Flashcards;