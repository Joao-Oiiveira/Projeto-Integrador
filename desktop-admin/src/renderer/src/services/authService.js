// services/authService.js — Autenticação do Administrador
const API_URL = 'http://127.0.0.1:8000/auth'
const TOKEN_KEY = '@EduAcess:adminToken'

/**
 * Realiza o login do administrador na API Python.
 *
 * REQUER INTERNET — não funciona offline por design de segurança:
 * o token precisa ser validado pelo servidor antes de qualquer acesso.
 *
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<object>} Dados do usuário logado
 * @throws {Error} Se as credenciais forem inválidas, o usuário não for admin,
 *                 ou se não houver conexão com o servidor.
 */
export async function loginAdmin(email, senha) {
  let response

  try {
    response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
  } catch {
    // fetch lançou exceção — servidor inacessível ou sem rede
    throw new Error('Sem conexão com o servidor. Verifique se a API está rodando.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'E-mail ou senha incorretos.')
  }

  const usuario = data.usuario

  // Barreira de segurança: somente admins podem entrar neste painel
  if (!usuario.is_admin) {
    throw new Error('Acesso negado. Esta conta não possui privilégios de administrador.')
  }

  // Persiste o token JWT para ser usado nas chamadas protegidas
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem('@EduAcess:adminUser', JSON.stringify(usuario))

  return usuario
}

/**
 * Retorna o token JWT do admin armazenado localmente, ou null.
 */
export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Retorna os dados do admin logado, ou null.
 */
export function getAdminUser() {
  const raw = localStorage.getItem('@EduAcess:adminUser')
  return raw ? JSON.parse(raw) : null
}

/**
 * Remove o token e os dados do admin do armazenamento local (Logout).
 */
export function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('@EduAcess:adminUser')
}
