import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { iniciarSessaoExercicios, responderQuestaoAPI, obterRelatorioExercicios } from '../services/exercicios';

const Exercicios = () => {
  // Estados de Fluxo: 'config', 'loading', 'resolucao', 'resumo'
  const [fluxo, setFluxo] = useState('config');
  const [abaAtiva, setAbaAtiva] = useState('simulado'); // 'simulado' ou 'desempenho'
  
  // Estado 1: Configuração
  const [config, setConfig] = useState({
    dificuldade: 'médio', // Substituiu o 'modo'
    tema: '',
    quantidade_questoes: 5
  });

  // Estado: Relatório
  const [relatorio, setRelatorio] = useState([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  // Estado 2: Dados da Sessão e Resolução
  const [sessao, setSessao] = useState(null);
  const [indiceQuestao, setIndiceQuestao] = useState(0);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [acertos, setAcertos] = useState(0);

  // ==========================================
  // EFEITOS E BUSCAS
  // ==========================================
  useEffect(() => {
    if (abaAtiva === 'desempenho') {
      carregarRelatorio();
    }
  }, [abaAtiva]);

  const carregarRelatorio = async () => {
    setLoadingRelatorio(true);
    try {
      const data = await obterRelatorioExercicios();
      setRelatorio(data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoadingRelatorio(false);
    }
  };

  // ==========================================
  // AÇÕES DO FLUXO
  // ==========================================
  const handleIniciarSessao = async (e) => {
    e.preventDefault();
    setFluxo('loading');
    
    try {
      const dadosSessao = await iniciarSessaoExercicios(config);
      if (!dadosSessao.questoes || dadosSessao.questoes.length === 0) {
        alert("Nenhuma questão encontrada para este tema.");
        setFluxo('config');
        return;
      }
      
      setSessao(dadosSessao);
      setIndiceQuestao(0);
      setAcertos(0);
      setAlternativaSelecionada(null);
      setRespondido(false);
      setFluxo('resolucao');
    } catch (error) {
      alert(error.message);
      setFluxo('config');
    }
  };

  const handleResponder = () => {
    if (!alternativaSelecionada) return;
    
    const questaoAtual = sessao.questoes[indiceQuestao];
    const acertou = alternativaSelecionada === questaoAtual.alternativa_correta;
    
    if (acertou) setAcertos(prev => prev + 1);
    setRespondido(true);

    responderQuestaoAPI(sessao.sessao_id, {
      identificador_externo: questaoAtual.identificador_externo,
      pergunta: questaoAtual.enunciado,
      alternativa_marcada: alternativaSelecionada,
      alternativa_correta: questaoAtual.alternativa_correta,
      origem: questaoAtual.origem
    });
  };

  const handleProximaQuestao = () => {
    if (indiceQuestao + 1 < sessao.questoes.length) {
      setIndiceQuestao(prev => prev + 1);
      setAlternativaSelecionada(null);
      setRespondido(false);
    } else {
      setFluxo('resumo');
    }
  };

  const reiniciar = () => {
    setFluxo('config');
    setSessao(null);
    setAbaAtiva('desempenho'); // Opcional: Joga pro relatório para ele ver o resultado salvo
  };

  // ==========================================
  // RENDERIZAÇÃO DOS ESTADOS
  // ==========================================

  // ESTADO: LOADING
  if (fluxo === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerando questões...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">A Inteligência Artificial está preparando seu simulado</p>
      </div>
    );
  }

  // ESTADO: RESUMO FINAL
  if (fluxo === 'resumo') {
    const aproveitamento = Math.round((acertos / sessao.questoes.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in-up w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-10 md:p-14 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center w-full">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl ${aproveitamento >= 60 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
            {aproveitamento >= 60 ? '🎉' : '💪'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sessão Finalizada!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Você concluiu as questões de {config.tema || 'Conhecimentos Gerais'}.</p>
          
          <div className="flex gap-6 mb-10 w-full justify-center">
            <div className="bg-gray-50 dark:bg-gray-700 px-8 py-5 rounded-2xl flex flex-col items-center min-w-[140px]">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Acertos</span>
              <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{acertos} <span className="text-xl text-gray-400">/ {sessao.questoes.length}</span></span>
            </div>
          </div>

          <Button text="Ver Meu Desempenho" onClick={reiniciar} className="bg-purple-600 hover:bg-purple-700 text-white border-none px-10 py-4 text-lg" />
        </div>
      </div>
    );
  }

  // ESTADO: RESOLUÇÃO DE QUESTÃO
  if (fluxo === 'resolucao' && sessao) {
    const questaoAtual = sessao.questoes[indiceQuestao];

    return (
      <div className="flex flex-col h-full animate-fade-in w-full max-w-4xl mx-auto pb-8">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <button onClick={() => setFluxo('config')} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-sm flex items-center gap-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Abandonar Sessão
          </button>
          <span className="bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
            Questão {indiceQuestao + 1} de {sessao.questoes.length}
          </span>
        </div>

        {/* CORREÇÃO DO SCROLL: Adicionado overflow-y-auto e max-h para garantir rolagem interna no mobile */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden max-h-[80vh]">
          
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {/* Enunciado */}
            <div className="p-6 md:p-10 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                  {config.dificuldade}
                </span>
              </div>
              <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {questaoAtual.enunciado}
              </p>
            </div>

            {/* Alternativas */}
            <div className="p-6 md:p-10 flex flex-col gap-3">
              {questaoAtual.alternativas.map((alt) => {
                const isSelecionada = alternativaSelecionada === alt.letra;
                const isCorreta = questaoAtual.alternativa_correta === alt.letra;
                
                let corClasse = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300";
                
                if (respondido) {
                  if (isCorreta) {
                    corClasse = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 font-medium";
                  } else if (isSelecionada && !isCorreta) {
                    corClasse = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300";
                  } else {
                    corClasse = "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60";
                  }
                } else if (isSelecionada) {
                  corClasse = "bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-900";
                }

                return (
                  <button
                    key={alt.letra}
                    disabled={respondido}
                    onClick={() => setAlternativaSelecionada(alt.letra)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${corClasse}`}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border-2 
                      ${respondido && isCorreta ? 'bg-green-500 border-green-500 text-white' : 
                        respondido && isSelecionada && !isCorreta ? 'bg-red-500 border-red-500 text-white' : 
                        isSelecionada ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 dark:border-gray-500'}`}
                    >
                      {alt.letra}
                    </span>
                    <span className="mt-1 leading-snug">{alt.texto}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
            {!respondido ? (
              <Button 
                text="Responder" 
                onClick={handleResponder}
                disabled={!alternativaSelecionada}
                className={`px-10 py-3 text-lg w-full sm:w-auto ${!alternativaSelecionada ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white border-none'}`}
              />
            ) : (
              <Button 
                text={indiceQuestao + 1 < sessao.questoes.length ? "Próxima Questão →" : "Ver Resultado"} 
                onClick={handleProximaQuestao}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 px-10 py-3 text-lg border-none w-full sm:w-auto"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 1: CONFIGURAÇÃO INICIAL E RELATÓRIO
  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full max-w-3xl mx-auto">
      <div className="text-center mb-2 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exercícios</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Pratique com questões geradas por Inteligência Artificial.</p>
      </div>

      {/* ABAS (TABS) */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-2">
        <button 
          onClick={() => setAbaAtiva('simulado')} 
          className={`pb-3 font-bold text-sm transition-colors relative ${abaAtiva === 'simulado' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Novo Simulado
          {abaAtiva === 'simulado' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-md"></span>}
        </button>
        <button 
          onClick={() => setAbaAtiva('desempenho')} 
          className={`pb-3 font-bold text-sm transition-colors relative ${abaAtiva === 'desempenho' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Meu Desempenho
          {abaAtiva === 'desempenho' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400 rounded-t-md"></span>}
        </button>
      </div>

      {/* CONTEÚDO DA ABA: NOVO SIMULADO */}
      {abaAtiva === 'simulado' && (
        <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in">
          <form onSubmit={handleIniciarSessao} className="flex flex-col gap-6">
            
            <Input 
              id="tema" 
              label="Tema Específico (Opcional)" 
              placeholder="Ex: Revolução Francesa, Funções, Genética..." 
              value={config.tema}
              onChange={e => setConfig({...config, tema: e.target.value})}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dificuldade</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-4 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer"
                  value={config.dificuldade}
                  onChange={e => setConfig({...config, dificuldade: e.target.value})}
                >
                  <option value="fácil">Fácil</option>
                  <option value="médio">Médio</option>
                  <option value="difícil">Difícil</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade de Questões</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setConfig({...config, quantidade_questoes: num})}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${config.quantidade_questoes === num ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-purple-300'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" text="Iniciar Sessão" className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white border-none py-4 text-lg" />
          </form>
        </div>
      )}

      {/* CONTEÚDO DA ABA: MEU DESEMPENHO */}
      {abaAtiva === 'desempenho' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {loadingRelatorio ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : relatorio.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum simulado realizado</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Seu histórico de desempenho aparecerá aqui após você concluir sua primeira sessão de exercícios.</p>
            </div>
          ) : (
            relatorio.map((item, index) => {
              const aproveitamento = Math.round((item.acertos / item.quantidade_questoes) * 100);
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.dificuldade === 'fácil' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        item.dificuldade === 'médio' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {item.dificuldade}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{item.data}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.tema || 'Conhecimentos Gerais'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.questoes_respondidas} de {item.quantidade_questoes} questões respondidas</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`text-2xl md:text-3xl font-bold ${aproveitamento >= 60 ? 'text-green-500' : 'text-orange-500'}`}>
                      {item.acertos}<span className="text-lg text-gray-300 dark:text-gray-600">/{item.quantidade_questoes}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Acertos</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Exercicios;