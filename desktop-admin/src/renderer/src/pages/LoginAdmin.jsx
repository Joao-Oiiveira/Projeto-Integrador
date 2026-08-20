// pages/LoginAdmin.jsx — Tela de login do Painel Administrativo
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../services/authService'
import useOnlineStatus from '../hooks/useOnlineStatus'

export default function LoginAdmin() {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOnline) return

    setErro('')
    setCarregando(true)

    try {
      await loginAdmin(email, senha)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Card central */}
      <div className="w-full max-w-md">

        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-5 shadow-lg shadow-indigo-900/40">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">EduAcess — Acesso restrito</p>
        </div>

        {/* Banner de offline */}
        {!isOnline && (
          <div className="flex items-center gap-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
            <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M4.929 4.929l14.142 14.142M9.88 9.88a3 3 0 014.243 4.243"
              />
            </svg>
            <span>
              <strong className="font-semibold">Sem conexão.</strong> Conexão com a internet necessária para autenticação.
            </span>
          </div>
        )}

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {/* Campo E-mail */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eduacess.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5">
            <label htmlFor="admin-senha" className="block text-sm font-medium text-gray-300">
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Mensagem de erro de credenciais */}
          {erro && (
            <div className="flex items-start gap-2 bg-red-950/50 border border-red-800/60 text-red-300 rounded-lg px-3 py-2.5 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{erro}</span>
            </div>
          )}

          {/* Botão de Login */}
          <button
            id="btn-login-admin"
            type="submit"
            disabled={!isOnline || carregando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2 mt-2"
          >
            {carregando ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Autenticando...
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-600 mt-6">
          EduAcess Admin · Acesso exclusivo para administradores
        </p>
      </div>
    </div>
  )
}
