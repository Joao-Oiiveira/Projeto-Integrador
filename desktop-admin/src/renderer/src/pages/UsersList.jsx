// pages/UsersList.jsx — Gestão de Usuários (listagem, alterar senha, excluir/banir)
import React, { useState, useEffect, useMemo } from 'react'
import { fetchUsuarios, excluirUsuario, alterarSenha } from '../services/usersService'
import useOnlineStatus from '../hooks/useOnlineStatus'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Input from '../components/Input'

const UsersList = () => {
  const isOnline = useOnlineStatus()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Estado do Modal de Alterar Senha
  const [senhaModal, setSenhaModal] = useState({ aberto: false, usuario: null })
  const [novaSenha, setNovaSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  // Estado do ConfirmModal de Exclusão
  const [excluirModal, setExcluirModal] = useState({ aberto: false, usuario: null })
  const [excluindo, setExcluindo] = useState(false)

  const carregarUsuarios = async () => {
    setCarregando(true)
    try {
      // fetchUsuarios nunca lança erro de rede — sempre retorna array (API ou cache local)
      const lista = await fetchUsuarios(isOnline)
      setUsuarios(lista)
      setErro('')
    } catch (error) {
      console.error('[UsersList] Erro inesperado ao buscar usuários:', error)
      setErro('Não foi possível carregar a lista de usuários.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [isOnline])

  // Filtro de busca
  const usuariosFiltrados = useMemo(() => {
    if (!busca.trim()) return usuarios
    const termo = busca.toLowerCase()
    return usuarios.filter(
      u =>
        (u.nome && u.nome.toLowerCase().includes(termo)) ||
        (u.email && u.email.toLowerCase().includes(termo))
    )
  }, [usuarios, busca])

  // Timer para limpar mensagens de sucesso
  useEffect(() => {
    if (sucesso) {
      const timer = setTimeout(() => setSucesso(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [sucesso])

  // ============================
  // HANDLERS
  // ============================
  const handleAbrirSenha = (usuario) => {
    setSenhaModal({ aberto: true, usuario })
    setNovaSenha('')
  }

  const handleSalvarSenha = async () => {
    if (!novaSenha.trim() || novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setSalvandoSenha(true)
    setErro('')
    try {
      const { sincronizado } = await alterarSenha(senhaModal.usuario.id, novaSenha)
      setSenhaModal({ aberto: false, usuario: null })
      setNovaSenha('')

      if (sincronizado) {
        // Operação executada na API imediatamente
        setSucesso(`✅ Senha de "${senhaModal.usuario.nome}" alterada com sucesso!`)
      } else {
        // API indisponível: ficou na fila offline
        setSucesso(`🕐 Servidor indisponível. Senha de "${senhaModal.usuario.nome}" salva na fila de sincronização.`)
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setErro('Falha ao alterar a senha. Tente novamente.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  const handleAbrirExcluir = (usuario) => {
    setExcluirModal({ aberto: true, usuario })
  }

  const handleConfirmarExcluir = async () => {
    setExcluindo(true)
    setErro('')
    try {
      const { sincronizado } = await excluirUsuario(excluirModal.usuario.id)
      const nomeUsuario = excluirModal.usuario.nome
      setExcluirModal({ aberto: false, usuario: null })

      if (sincronizado) {
        // Operação executada na API imediatamente
        setSucesso(`✅ Usuário "${nomeUsuario}" removido com sucesso!`)
      } else {
        // API indisponível: ficou na fila offline
        setSucesso(`🕐 Servidor indisponível. Exclusão de "${nomeUsuario}" salva na fila de sincronização.`)
      }

      await carregarUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      setErro('Falha ao excluir o usuário. Tente novamente.')
    } finally {
      setExcluindo(false)
    }
  }

  // Iniciais do nome para o avatar
  const getIniciais = (nome) => {
    if (!nome) return '?'
    const partes = nome.trim().split(' ')
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    return partes[0][0].toUpperCase()
  }

  // Cores de avatar baseado no nome (determinístico) — paleta azul/slate
  const getAvatarColor = (nome) => {
    const cores = [
      'bg-blue-100 text-blue-700',
      'bg-sky-100 text-sky-700',
      'bg-emerald-100 text-emerald-700',
      'bg-orange-100 text-orange-700',
      'bg-teal-100 text-teal-700',
      'bg-slate-100 text-slate-700',
      'bg-indigo-100 text-indigo-700',
      'bg-cyan-100 text-cyan-700',
    ]
    if (!nome) return cores[0]
    let hash = 0
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
    return cores[Math.abs(hash) % cores.length]
  }

  // Determina estilo do toast: sucesso real vs. enfileirado
  const getSucessoStyle = () => {
    if (sucesso.startsWith('🕐')) {
      return 'bg-orange-50 border-orange-200 text-orange-800'
    }
    return 'bg-emerald-50 border-emerald-200 text-emerald-800'
  }

  const getSucessoIconStyle = () => {
    if (sucesso.startsWith('🕐')) {
      return 'text-orange-500'
    }
    return 'text-emerald-500'
  }

  const getSucessoIconPath = () => {
    if (sucesso.startsWith('🕐')) {
      // Ícone de relógio/fila
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    }
    // Ícone de check
    return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">
            {carregando ? 'Carregando...' : `${usuarios.length} usuário(s) cadastrado(s)`}
          </p>
        </div>

        {/* Badge Online/Offline */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm border
          ${isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : 'bg-red-50 text-red-700 border-red-100'
          }
        `}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {isOnline ? 'API Online' : 'API Offline'}
        </div>
      </div>

      {/* Aviso offline */}
      {!isOnline && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong className="font-semibold">Servidor indisponível.</strong> As ações serão salvas na fila e sincronizadas quando a API voltar.
          </span>
        </div>
      )}

      {/* Toast de sucesso / enfileirado */}
      {sucesso && (
        <div className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up ${getSucessoStyle()}`}>
          <svg className={`w-5 h-5 shrink-0 ${getSucessoIconStyle()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getSucessoIconPath()} />
          </svg>
          <span>{sucesso.replace(/^[✅🕐]\s?/, '')}</span>
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && !senhaModal.aberto && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up">
          <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{erro}</span>
          <button onClick={() => setErro('')} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Barra de busca */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-200 transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabela / Grid de Usuários */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header da tabela */}
        <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1.2fr] gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Usuário</span>
          <span>E-mail</span>
          <span>Nível</span>
          <span>Tipo</span>
          <span className="text-right">Ações</span>
        </div>

        {/* Loading skeleton */}
        {carregando ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3 text-gray-400">
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-sm font-medium">
              {busca ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {usuariosFiltrados.map((usuario, index) => (
              <div
                key={usuario.id}
                className="flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1.2fr] gap-2 md:gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors animate-slide-in items-center"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Avatar + Nome */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(usuario.nome)}`}>
                    {getIniciais(usuario.nome)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">{usuario.nome || 'Sem nome'}</span>
                    <span className="text-xs text-slate-400 md:hidden truncate">{usuario.email}</span>
                  </div>
                </div>

                {/* E-mail (apenas desktop) */}
                <span className="hidden md:block text-sm text-slate-600 truncate">{usuario.email}</span>

                {/* Nível */}
                <span className="hidden md:block text-sm text-slate-600">{usuario.nivel || '—'}</span>

                {/* Tipo (Admin/Estudante) */}
                <div className="hidden md:block">
                  {usuario.is_admin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Estudante
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 justify-end w-full md:w-auto mt-2 md:mt-0">
                  {/* Botão Alterar Senha */}
                  <button
                    onClick={() => handleAbrirSenha(usuario)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-xl text-xs font-bold transition-all"
                    title="Alterar Senha"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="hidden sm:inline">Senha</span>
                  </button>

                  {/* Botão Excluir */}
                  <button
                    onClick={() => handleAbrirExcluir(usuario)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 rounded-xl text-xs font-bold transition-all"
                    title="Excluir Usuário"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================
          MODAL: ALTERAR SENHA
          ============================ */}
      <Modal
        isOpen={senhaModal.aberto}
        onClose={() => {
          setSenhaModal({ aberto: false, usuario: null })
          setNovaSenha('')
          setErro('')
        }}
        title="Alterar Senha"
      >
        <div className="flex flex-col gap-5">
          {senhaModal.usuario && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(senhaModal.usuario.nome)}`}>
                {getIniciais(senhaModal.usuario.nome)}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">{senhaModal.usuario.nome}</span>
                <p className="text-xs text-slate-500">{senhaModal.usuario.email}</p>
              </div>
            </div>
          )}

          <Input
            label="Nova Senha"
            id="nova-senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />

          {/* Erro dentro do modal */}
          {erro && senhaModal.aberto && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {erro}
            </div>
          )}

          {!isOnline && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Servidor indisponível. A operação será salva na fila e sincronizada automaticamente.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setSenhaModal({ aberto: false, usuario: null })
                setNovaSenha('')
                setErro('')
              }}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvarSenha}
              disabled={salvandoSenha || !novaSenha.trim()}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {salvandoSenha ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================
          CONFIRM MODAL: EXCLUIR
          ============================ */}
      <ConfirmModal
        isOpen={excluirModal.aberto}
        title="Excluir Usuário?"
        message={
          excluirModal.usuario
            ? `Tem certeza que deseja excluir "${excluirModal.usuario.nome}"? Esta ação não pode ser desfeita.${!isOnline ? ' O servidor está indisponível — a exclusão será salva na fila e sincronizada automaticamente.' : ''}`
            : ''
        }
        confirmText="Sim, Excluir"
        onConfirm={handleConfirmarExcluir}
        onCancel={() => setExcluirModal({ aberto: false, usuario: null })}
        loading={excluindo}
      />
    </div>
  )
}

export default UsersList
