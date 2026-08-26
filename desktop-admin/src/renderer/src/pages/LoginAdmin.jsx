// pages/LoginAdmin.jsx — Tela de login do Painel Administrativo
// Layout dividido: formulário (esquerda) + imagem tech com overlay (direita)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../services/authService'
import useOnlineStatus from '../hooks/useOnlineStatus'

// Imagem Unsplash: data center / servidor / tecnologia
const HERO_IMAGE = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&auto=format&fit=crop'

export default function LoginAdmin() {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

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
    <div className="min-h-screen flex">

      {/* ============================
          LADO ESQUERDO — FORMULÁRIO
          ============================ */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 bg-slate-50 relative">

        {/* Logo no topo */}
        <div className="absolute top-8 left-8 sm:left-12 lg:left-16 flex items-center gap-3">
          <div className="bg-slate-900 text-white w-9 h-9 flex items-center justify-center rounded-xl font-bold text-lg shadow-sm">
            e.
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-slate-900">EduAcess</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-700">Admin</span>
          </div>
        </div>

        {/* Conteúdo centralizado do formulário */}
        <div className="w-full max-w-sm mx-auto">

          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-700 mb-5 shadow-lg shadow-blue-900/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm mt-1">Acesse o painel com suas credenciais de administrador.</p>
          </div>

          {/* Banner de offline */}
          {!isOnline && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-6 text-sm animate-fade-in-up">
              <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M4.929 4.929l14.142 14.142M9.88 9.88a3 3 0 014.243 4.243"
                />
              </svg>
              <span>
                <strong className="font-semibold">Sem conexão.</strong> O login requer acesso ao servidor.
              </span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduacess.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label htmlFor="admin-senha" className="block text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="admin-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-12 py-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de erro de credenciais */}
            {erro && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm animate-fade-in-up">
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
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2 mt-2 shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 active:scale-[0.98]"
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
                <>
                  Entrar no Painel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Rodapé */}
          <p className="text-center text-xs text-slate-400 mt-8">
            EduAcess Admin · Acesso exclusivo para administradores
          </p>
        </div>
      </div>

      {/* ============================
          LADO DIREITO — IMAGEM HERO
          ============================ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">

        {/* Imagem de fundo (servidores/tecnologia) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden="true"
        />

        {/* Overlay gradiente escuro-azulado */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,58,138,0.72) 60%, rgba(15,23,42,0.60) 100%)'
          }}
          aria-hidden="true"
        />

        {/* Conteúdo sobre o overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Topo: badge de segurança */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-white/80 text-xs font-medium">Área Restrita</span>
            </div>
          </div>

          {/* Centro: texto principal */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="w-14 h-1 bg-blue-500 rounded-full" />
              <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
                Painel Administrativo<br />
                <span className="text-blue-400">EduAcess</span>
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-md">
                Gerencie usuários, monitore o sistema e aplique configurações com segurança e controle total da plataforma.
              </p>
            </div>

            {/* Cards de features */}
            <div className="grid grid-cols-1 gap-3 mt-2">
              {[
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  label: 'Gestão de Usuários & Permissões'
                },
                {
                  icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
                  label: 'Sincronização Offline Automática'
                },
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  label: 'Dashboard de Métricas em Tempo Real'
                }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                  <div className="p-2 bg-blue-600/30 rounded-xl shrink-0">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé do hero */}
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Conexão protegida · Somente administradores
          </div>
        </div>
      </div>

    </div>
  )
}
