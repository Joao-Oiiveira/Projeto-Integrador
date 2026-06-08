import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const TTSReader = () => {
  const { configuracoes } = useAccessibility();
  const [isReading, setIsReading] = useState(false);

  // Limpa a voz se o componente for desmontado (Evita a tela branca)
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!configuracoes.leitura_texto) return null;

  const toggleReading = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const mainContent = document.querySelector('main');
      if (!mainContent) return;

      // INTELIGÊNCIA: Pega apenas títulos (h1 a h4) e parágrafos (p)
      const elementos = mainContent.querySelectorAll('h1, h2, h3, h4, p');
      
      // Junta o texto separando por ponto para o robô respirar
      let textToRead = Array.from(elementos)
        .map(el => el.innerText.trim())
        .filter(text => text.length > 0)
        .join('. ');

      if (!textToRead) {
        textToRead = "Não encontrei textos principais para ler nesta tela.";
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      
      // Eventos de segurança
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <button
      onClick={toggleReading}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm
        ${isReading ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'}`}
      title="Ler conteúdo da tela"
    >
      {isReading ? (
        <>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
          Parar Leitura
        </>
      ) : (
        <>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          Ler Tela
        </>
      )}
    </button>
  );
};

export default TTSReader;