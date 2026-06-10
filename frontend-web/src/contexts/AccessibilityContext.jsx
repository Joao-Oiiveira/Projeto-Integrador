import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLoggedUser, saveOnboardingDataAPI } from '../services/auth'; 

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [configuracoes, setConfiguracoes] = useState({
    tamanho_fonte: 16,
    leitura_texto: false,
    tema_escuro: false,
    fonte_dislexia: false,
  });

  useEffect(() => {
    const user = getLoggedUser();
    if (user && user.configuracoes) {
      setConfiguracoes(user.configuracoes);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    html.style.fontSize = `${configuracoes.tamanho_fonte}px`;

    if (configuracoes.tema_escuro) html.classList.add('dark');
    else html.classList.remove('dark');

    // Usa a classe suprema criada no CSS
    if (configuracoes.fonte_dislexia) html.classList.add('dislexia-mode');
    else html.classList.remove('dislexia-mode');
    
  }, [configuracoes]);

  const updateAccessibility = async (novasConfigs) => {
    try {
      const user = getLoggedUser();
      if (!user) return;

      const updatedConfigs = { ...configuracoes, ...novasConfigs };
      
      // Atualiza a tela PRIMEIRO (Evita travamentos/tela branca)
      setConfiguracoes(updatedConfigs);

      // Depois salva na API em background
      await saveOnboardingDataAPI(user.nome, user.perfil || user.perfil_usuario, updatedConfigs);
    } catch (error) {
      console.error("Erro ao atualizar acessibilidade:", error);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ configuracoes, updateAccessibility }}>
      {children}
    </AccessibilityContext.Provider>
  );
};