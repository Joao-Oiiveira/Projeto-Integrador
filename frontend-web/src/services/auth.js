// services/auth.js

const API_URL = 'http://localhost:8000/auth';
const TOKEN_KEY = '@EduAcess:token';
const USER_KEY = '@EduAcess:loggedUser';

// 1. Função de Cadastro (Registro)
export const registerAPI = async (nome, email, senha) => {
  if (!nome || !email || !senha) throw new Error("Preencha todos os campos.");

  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Erro ao cadastrar usuário.");
  }

  // Salva o token e os dados na sessão
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  
  return data.usuario;
};

// 2. Função de Autenticação (Login)
export const loginAPI = async (email, senha) => {
  if (!email || !senha) throw new Error("Preencha todos os campos.");

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "E-mail ou senha incorretos.");
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  
  return data.usuario;
};

// 3. Pegar usuário logado (Lê da memória local, continua síncrono)
export const getLoggedUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// 4. Salvar dados do Onboarding
export const saveOnboardingDataAPI = async (nomeAtualizado, perfil, configuracoes) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error("Usuário não autenticado.");

  const response = await fetch(`${API_URL}/onboarding`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Envia o Token de segurança
    },
    body: JSON.stringify({ 
      nome: nomeAtualizado, 
      perfil: perfil, 
      configuracoes: configuracoes 
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Erro ao salvar dados.");
  }

  // Atualiza a sessão com os dados retornados do banco
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
};

// 5. Função de Logout
export const logoutAPI = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};