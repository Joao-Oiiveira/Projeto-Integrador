import React, { createContext, useContext, useState, useEffect } from 'react';
// Importe a função do seu serviço de auth (ajuste o nome se no seu arquivo estiver diferente)
import { getLoggedUser, saveOnboardingDataAPI } from '../services/auth'; 

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  // Estado inicial padrão
  const [configuracoes, setConfiguracoes] = useState({
    tamanho_fonte: 16,
    leitura_texto: false,
    tema_escuro: false,
    fonte_dislexia: false,
  });

  // 1. Ao carregar o app, busca as configurações do usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (user && user.configuracoes) {
      // Se o backend retornar configuracoes_usuario, ajuste a chave aqui
      setConfiguracoes(user.configuracoes);
    }
  }, []);

  // 2. Sempre que "configuracoes" mudar, injeta as regras no HTML/Body
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Tamanho da Fonte
    html.style.fontSize = `${configuracoes.tamanho_fonte}px`;

    // Tema Escuro
    if (configuracoes.tema_escuro) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Fonte para Dislexia (Corrigido: Aplicando direto no style para o Tailwind não bloquear)
    if (configuracoes.fonte_dislexia) {
      body.style.fontFamily = "'OpenDyslexic', sans-serif";
    } else {
      body.style.fontFamily = ""; // Volta para a fonte padrão do Tailwind
    }
  }, [configuracoes]);

  // 3. Função global para atualizar as configurações na API e na Tela
  const updateAccessibility = async (novasConfigs) => {
    try {
      const user = getLoggedUser();
      if (!user) throw new Error("Usuário não logado");

      // Mescla as configurações antigas com as novas
      const updatedConfigs = { ...configuracoes, ...novasConfigs };
      
      // Chama a API (passando nome, perfil e as novas configurações)
      // Nota: Use 'user.perfil' ou 'user.perfil_usuario' dependendo de como o FastAPI está retornando
      await saveOnboardingDataAPI(user.nome, user.perfil || user.perfil_usuario, updatedConfigs);

      // Se a API der sucesso, atualiza a tela instantaneamente
      setConfiguracoes(updatedConfigs);
    } catch (error) {
      console.error("Erro ao atualizar acessibilidade:", error);
      throw error;
    }
  };

  return (
    <AccessibilityContext.Provider value={{ configuracoes, updateAccessibility }}>
      {children}
    </AccessibilityContext.Provider>
  );
};