import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLoggedUser, saveOnboardingDataAPI } from '../services/auth'; 

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

const DEFAULT_CONFIGS = {
  tamanho_fonte: 16,
  leitura_texto: false,
  tema_escuro: false,
  fonte_dislexia: false,
  espacamento_linhas: 'padrao',
  espacamento_letras: 'padrao',
  espacamento_palavras: 'padrao',
};

const STORAGE_KEY = '@EduAcess:accessibility_settings';

export const AccessibilityProvider = ({ children }) => {
  const [configuracoes, setConfiguracoes] = useState(() => {
    const user = getLoggedUser();
    if (user && user.configuracoes) {
      return { ...DEFAULT_CONFIGS, ...user.configuracoes };
    }
    if (user && !user.perfil && !user.perfil_usuario) {
      // Novo usuário no onboarding deve iniciar com configurações padrão
      return DEFAULT_CONFIGS;
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return { ...DEFAULT_CONFIGS, ...JSON.parse(local) };
      } catch (e) {
        // ignore parse error
      }
    }
    return DEFAULT_CONFIGS;
  });

  useEffect(() => {
    const user = getLoggedUser();
    if (user && user.configuracoes) {
      setConfiguracoes(prev => ({
        ...prev,
        ...user.configuracoes,
      }));
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    html.style.fontSize = `${configuracoes.tamanho_fonte || 16}px`;

    if (configuracoes.tema_escuro) html.classList.add('dark');
    else html.classList.remove('dark');

    // Usa a classe criada no CSS para dislexia
    if (configuracoes.fonte_dislexia) html.classList.add('dislexia-mode');
    else html.classList.remove('dislexia-mode');

    // Espaçamento entre linhas, letras e palavras
    const lineHeightsMap = {
      padrao: 'normal',
      moderado: '1.8',
      ampliado: '2.2',
    };
    const letterSpacingsMap = {
      padrao: 'normal',
      moderado: '0.08em',
      ampliado: '0.16em',
    };
    const wordSpacingsMap = {
      padrao: 'normal',
      moderado: '0.16em',
      ampliado: '0.32em',
    };

    const lineHeight = lineHeightsMap[configuracoes.espacamento_linhas] || 'normal';
    const letterSpacing = letterSpacingsMap[configuracoes.espacamento_letras] || 'normal';
    const wordSpacing = wordSpacingsMap[configuracoes.espacamento_palavras] || 'normal';

    html.style.setProperty('--eduacess-line-height', lineHeight);
    html.style.setProperty('--eduacess-letter-spacing', letterSpacing);
    html.style.setProperty('--eduacess-word-spacing', wordSpacing);

    const hasCustomSpacing = 
      (configuracoes.espacamento_linhas && configuracoes.espacamento_linhas !== 'padrao') ||
      (configuracoes.espacamento_letras && configuracoes.espacamento_letras !== 'padrao') ||
      (configuracoes.espacamento_palavras && configuracoes.espacamento_palavras !== 'padrao');

    if (hasCustomSpacing) {
      html.setAttribute('data-custom-spacing', 'true');
    } else {
      html.removeAttribute('data-custom-spacing');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configuracoes));
    } catch (e) {
      console.warn("Não foi possível salvar configurações no localStorage", e);
    }
  }, [configuracoes]);

  const updateAccessibility = async (novasConfigs) => {
    try {
      const updatedConfigs = { ...configuracoes, ...novasConfigs };
      
      // Atualiza a tela PRIMEIRO (Evita travamentos/tela branca)
      setConfiguracoes(updatedConfigs);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
      } catch (e) {}

      const user = getLoggedUser();
      if (!user) return;

      user.configuracoes = updatedConfigs;
      localStorage.setItem('@EduAcess:loggedUser', JSON.stringify(user));

      // Depois salva na API em background (somente se o usuário já tiver perfil concluído)
      if (user && (user.perfil || user.perfil_usuario)) {
        await saveOnboardingDataAPI(user.nome, user.perfil || user.perfil_usuario, updatedConfigs);
      }
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