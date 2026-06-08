import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { iniciarSessaoExercicios, responderQuestaoAPI } from '../services/exercicios';

const Exercicios = () => {
  // Estados de Fluxo: 'config', 'loading', 'resolucao', 'resumo'
  const [fluxo, setFluxo] = useState('config');
  
  // Estado 1: Configuração
  const [config, setConfig] = useState({
    modo: 'vestibular',
    tema: '',
    quantidade_questoes: 5
  });

  // Estado 2: Dados da Sessão e Resolução
  const [sessao, setSessao] = useState(null);
  const [indiceQuestao, setIndiceQuestao] = useState(0);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [acertos, setAcertos] = useState(0);

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

    // Salva no banco em background (Fire and Forget)
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
  };

  // ==========================================
  // RENDERIZAÇÃO DOS ESTADOS
  // ==========================================

  // ESTADO: LOADING
  if (fluxo === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buscando questões...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Conectando à base de dados do ENEM</p>
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

          <Button text="Fazer Novos Exercícios" onClick={reiniciar} className="bg-purple-600 hover:bg-purple-700 text-white border-none px-10 py-4 text-lg" />
        </div>
      </div>
    );
  }

  // ESTADO: RESOLUÇÃO DE QUESTÃO
  if (fluxo === 'resolucao' && sessao) {
    const questaoAtual = sessao.questoes[indiceQuestao];

    return (
      <div className="flex flex-col h-full animate-fade-in w-full max-w-4xl mx-auto pb-8">
        {/* Cabeçalho da Resolução */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={reiniciar} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-sm flex items-center gap-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Abandonar Sessão
          </button>
          <span className="bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
            Questão {indiceQuestao + 1} de {sessao.questoes.length}
          </span>
        </div>

        {/* Card da Questão */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          
          {/* Enunciado */}
          <div className="p-6 md:p-10 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                {questaoAtual.origem === 'enem_api' ? 'ENEM' : 'Gerado por IA'}
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
              
              // Lógica de cores após responder
              let corClasse = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300";
              
              if (respondido) {
                if (isCorreta) {
                  corClasse = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 font-medium"; // Destaca a correta
                } else if (isSelecionada && !isCorreta) {
                  corClasse = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300"; // Destaca o erro do usuário
                } else {
                  corClasse = "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60"; // Apaga as outras
                }
              } else if (isSelecionada) {
                corClasse = "bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-900"; // Seleção antes de responder
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

          {/* Rodapé com Botões de Ação */}
          <div className="p-6 md:p-10 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            {!respondido ? (
              <Button 
                text="Responder" 
                onClick={handleResponder}
                disabled={!alternativaSelecionada}
                className={`px-10 py-3 text-lg ${!alternativaSelecionada ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white border-none'}`}
              />
            ) : (
              <Button 
                text={indiceQuestao + 1 < sessao.questoes.length ? "Próxima Questão →" : "Ver Resultado"} 
                onClick={handleProximaQuestao}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 px-10 py-3 text-lg border-none"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 1: CONFIGURAÇÃO INICIAL (Padrão)
  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in w-full max-w-3xl mx-auto">
      <div className="text-center mb-4 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exercícios</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Pratique com questões do ENEM ou geradas por IA.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleIniciarSessao} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo de Estudo</label>
            <select 
              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-4 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer"
              value={config.modo}
              onChange={e => setConfig({...config, modo: e.target.value})}
            >
              <option value="vestibular">Questões Oficiais (ENEM/Vestibulares)</option>
              <option value="ia">Questões Inéditas (Geradas por IA)</option>
            </select>
          </div>

          <Input 
            id="tema" 
            label="Tema Específico (Opcional)" 
            placeholder="Ex: Revolução Francesa, Funções, Genética..." 
            value={config.tema}
            onChange={e => setConfig({...config, tema: e.target.value})}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade de Questões</label>
            <div className="grid grid-cols-3 gap-4">
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

          <Button type="submit" text="Iniciar Sessão" className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white border-none py-4 text-lg" />
        </form>
      </div>
    </div>
  );
};

export default Exercicios;