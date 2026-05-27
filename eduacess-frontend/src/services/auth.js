// services/auth.js

const DB_USERS_KEY = '@EduAcess:users_db'; // "Tabela" de usuários
const LOGGED_USER_KEY = '@EduAcess:loggedUser'; // Sessão atual

// 1. Função de Cadastro (Registro)
export const registerMock = (nome, email, senha) => {
  if (!nome || !email || !senha) throw new Error("Preencha todos os campos.");
  
  // Pega a lista de usuários ou cria um array vazio
  let users = JSON.parse(localStorage.getItem(DB_USERS_KEY)) ||[];
  
  // Verifica se o email já existe
  if (users.find(u => u.email === email)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  // Cria o usuário respeitando a tabela do banco
  const newUser = {
    id: users.length + 1, // Auto incremento simples
    nome: nome,
    email: email,
    senha: senha, // Num sistema real seria criptografada (hash)
    perfil_usuario: null,
    configuracoes_usuario: null
  };

  // Salva no banco simulado e já faz o login automático
  users.push(newUser);
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(newUser)); 
  
  return newUser;
};

// 2. Função de Autenticação (Login)
export const loginMock = (email, senha) => {
  if (!email || !senha) throw new Error("Preencha todos os campos.");
  
  let users = JSON.parse(localStorage.getItem(DB_USERS_KEY)) ||[];
  
  // Busca usuário que combine email e senha
  const user = users.find(u => u.email === email && u.senha === senha);

  if (!user) throw new Error("E-mail ou senha incorretos.");

  // Salva na sessão
  localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(user));
  return user;
};

// 3. Pegar usuário logado
export const getLoggedUser = () => {
  const user = localStorage.getItem(LOGGED_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// 4. Salvar dados do Onboarding
export const saveOnboardingData = (nomeAtualizado, perfil, configuracoes) => {
  const loggedUser = getLoggedUser();
  if (!loggedUser) throw new Error("Usuário não autenticado.");

  let users = JSON.parse(localStorage.getItem(DB_USERS_KEY)) ||[];
  
  // Atualiza o objeto do usuário
  const updatedUser = {
    ...loggedUser,
    nome: nomeAtualizado,
    perfil_usuario: { id: 1, usuario_id: loggedUser.id, ...perfil },
    configuracoes_usuario: { id: 1, usuario_id: loggedUser.id, ...configuracoes }
  };

  // Atualiza no "banco de dados"
  const updatedUsers = users.map(u => u.id === loggedUser.id ? updatedUser : u);
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(updatedUsers));
  
  // Atualiza na sessão
  localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};