// pages/UsersList.jsx — Gestão de Usuários (CRUD completo + Offline-First)
import React, { useState, useEffect, useMemo } from 'react'
import {
  fetchUsuarios,
  excluirUsuario,
  alterarSenha,
  criarUsuario,
  editarUsuario
} from '../services/usersService'
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

  // Estado do Modal de Cadastrar Usuário
  const [cadastrarModal, setCadastrarModal] = useState(false)
  const [formCadastro, setFormCadastro] = useState({ nome: '', email: '', senha: '', is_admin: false })
  const [salvandoCadastro, setSalvandoCadastro] = useState(false)
  const [erroCadastro, setErroCadastro] = useState('')

  // Estado do Modal de Editar Usuário
  const [editarModal, setEditarModal] = useState({ aberto: false, usuario: null })
  const [formEdicao, setFormEdicao] = useState({ nome: '', email: '', is_admin: false })
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [erroEdicao, setErroEdicao] = useState('')

  // Estado do Modal de Detalhes (somente leitura)
  const [detalhesModal, setDetalhesModal] = useState({ aberto: false, usuario: null })

  const carregarUsuarios = async () => {
    setCarregando(true)
    try {
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
  // HANDLERS — SENHA
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
        setSucesso(`✅ Senha de "${senhaModal.usuario.nome}" alterada com sucesso!`)
      } else {
        setSucesso(`🕐 Servidor indisponível. Senha de "${senhaModal.usuario.nome}" salva na fila de sincronização.`)
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setErro('Falha ao alterar a senha. Tente novamente.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  // ============================
  // HANDLERS — EXCLUIR
  // ============================
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
        setSucesso(`✅ Usuário "${nomeUsuario}" removido com sucesso!`)
      } else {
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

  // ============================
  // HANDLERS — CADASTRAR
  // ============================
  const handleAbrirCadastrar = () => {
    setFormCadastro({ nome: '', email: '', senha: '', is_admin: false })
    setErroCadastro('')
    setCadastrarModal(true)
  }

  const handleSalvarCadastro = async () => {
    if (!formCadastro.nome.trim()) { setErroCadastro('O nome é obrigatório.'); return }
    if (!formCadastro.email.trim() || !formCadastro.email.includes('@')) { setErroCadastro('Informe um e-mail válido.'); return }
    if (!formCadastro.senha.trim() || formCadastro.senha.length < 6) { setErroCadastro('A senha deve ter pelo menos 6 caracteres.'); return }

    setSalvandoCadastro(true)
    setErroCadastro('')
    try {
      const { sincronizado, usuario } = await criarUsuario(formCadastro)
      setCadastrarModal(false)
      setFormCadastro({ nome: '', email: '', senha: '', is_admin: false })
      if (sincronizado) {
        setSucesso(`✅ Usuário "${usuario.nome}" cadastrado com sucesso!`)
      } else {
        setSucesso(`🕐 Servidor indisponível. "${usuario.nome}" salvo localmente e será sincronizado em breve.`)
      }
      await carregarUsuarios()
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      setErroCadastro(error.message || 'Falha ao cadastrar o usuário. Tente novamente.')
    } finally {
      setSalvandoCadastro(false)
    }
  }

  // ============================
  // HANDLERS — EDITAR
  // ============================
  const handleAbrirEditar = (usuario) => {
    setFormEdicao({ nome: usuario.nome || '', email: usuario.email || '', is_admin: usuario.is_admin || false })
    setErroEdicao('')
    setEditarModal({ aberto: true, usuario })
  }

  const handleSalvarEdicao = async () => {
    if (!formEdicao.nome.trim()) { setErroEdicao('O nome é obrigatório.'); return }
    if (!formEdicao.email.trim() || !formEdicao.email.includes('@')) { setErroEdicao('Informe um e-mail válido.'); return }

    setSalvandoEdicao(true)
    setErroEdicao('')
    try {
      const { sincronizado } = await editarUsuario(editarModal.usuario.id, formEdicao)
      const nomeAtualizado = formEdicao.nome
      setEditarModal({ aberto: false, usuario: null })
      if (sincronizado) {
        setSucesso(`✅ Usuário "${nomeAtualizado}" atualizado com sucesso!`)
      } else {
        setSucesso(`🕐 Servidor indisponível. Edição de "${nomeAtualizado}" salva na fila de sincronização.`)
      }
      await carregarUsuarios()
    } catch (error) {
      console.error('Erro ao editar usuário:', error)
      setErroEdicao(error.message || 'Falha ao atualizar o usuário. Tente novamente.')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  // ============================
  // HANDLERS — DETALHES
  // ============================
  const handleAbrirDetalhes = (usuario) => {
    setDetalhesModal({ aberto: true, usuario })
  }

  // ============================
  // HELPERS DE UI
  // ============================
  const isPendente = (usuario) => usuario.id < 0

  const getIniciais = (nome) => {
    if (!nome) return '?'
    const partes = nome.trim().split(' ')
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    return partes[0][0].toUpperCase()
  }

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

  const getSucessoStyle = () => {
    if (sucesso.startsWith('🕐')) return 'bg-orange-50 border-orange-200 text-orange-800'
    return 'bg-emerald-50 border-emerald-200 text-emerald-800'
  }
  const getSucessoIconStyle = () => sucesso.startsWith('🕐') ? 'text-orange-500' : 'text-emerald-500'
  const getSucessoIconPath = () => sucesso.startsWith('🕐')
    ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'

  const formatarData = (dataStr) => {
    if (!dataStr) return '—'
    try {
      return new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return dataStr }
  }

  // ============================
  // RENDER
  // ============================
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

        <div className="flex items-center gap-3">
          {/* Botão Cadastrar Usuário */}
          <button
            id="btn-cadastrar-usuario"
            onClick={handleAbrirCadastrar}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Cadastrar Usuário
          </button>

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
        <div className="hidden md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1.8fr] gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-slate-500">
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
            {usuariosFiltrados.map((usuario, index) => {
              const pendente = isPendente(usuario)
              return (
                <div
                  key={usuario.id}
                  className={`flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1.8fr] gap-2 md:gap-4 px-6 py-4 transition-colors animate-slide-in items-center
                    ${pendente ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50/80'}
                  `}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Avatar + Nome */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(usuario.nome)}`}>
                      {getIniciais(usuario.nome)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">{usuario.nome || 'Sem nome'}</span>
                        {pendente && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pendente
                          </span>
                        )}
                      </div>
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
                  <div className="flex items-center gap-1.5 justify-end w-full md:w-auto mt-2 md:mt-0">

                    {/* Botão Detalhes (Olho) — sempre habilitado */}
                    <button
                      id={`btn-detalhes-${usuario.id}`}
                      onClick={() => handleAbrirDetalhes(usuario)}
                      className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-sky-50 hover:text-sky-700 text-gray-500 rounded-xl transition-all"
                      title="Ver Detalhes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Botão Editar (Lápis) — desabilitado se ID temporário */}
                    <div className="relative group">
                      <button
                        id={`btn-editar-${usuario.id}`}
                        onClick={() => !pendente && handleAbrirEditar(usuario)}
                        disabled={pendente}
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all
                          ${pendente
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-500'
                          }
                        `}
                        title={pendente ? 'Sincronização pendente' : 'Editar Usuário'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {pendente && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Sincronização pendente
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
                        </div>
                      )}
                    </div>

                    {/* Botão Alterar Senha — desabilitado se ID temporário */}
                    <div className="relative group">
                      <button
                        id={`btn-senha-${usuario.id}`}
                        onClick={() => !pendente && handleAbrirSenha(usuario)}
                        disabled={pendente}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                          ${pendente
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600'
                          }
                        `}
                        title={pendente ? 'Sincronização pendente' : 'Alterar Senha'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span className="hidden sm:inline">Senha</span>
                      </button>
                      {pendente && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Sincronização pendente
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
                        </div>
                      )}
                    </div>

                    {/* Botão Excluir — desabilitado se ID temporário */}
                    <div className="relative group">
                      <button
                        id={`btn-excluir-${usuario.id}`}
                        onClick={() => !pendente && handleAbrirExcluir(usuario)}
                        disabled={pendente}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                          ${pendente
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600'
                          }
                        `}
                        title={pendente ? 'Sincronização pendente' : 'Excluir Usuário'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                      {pendente && (
                        <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          Sincronização pendente
                          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ============================
          MODAL: CADASTRAR USUÁRIO
          ============================ */}
      <Modal
        isOpen={cadastrarModal}
        onClose={() => { setCadastrarModal(false); setErroCadastro('') }}
        title="Cadastrar Novo Usuário"
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Nome Completo"
            id="cadastro-nome"
            type="text"
            placeholder="Ex: Maria Silva"
            value={formCadastro.nome}
            onChange={(e) => setFormCadastro(f => ({ ...f, nome: e.target.value }))}
          />
          <Input
            label="E-mail"
            id="cadastro-email"
            type="email"
            placeholder="Ex: maria@escola.edu.br"
            value={formCadastro.email}
            onChange={(e) => setFormCadastro(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Senha"
            id="cadastro-senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formCadastro.senha}
            onChange={(e) => setFormCadastro(f => ({ ...f, senha: e.target.value }))}
          />

          {/* Checkbox É Administrador */}
          <label
            htmlFor="cadastro-is-admin"
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 select-none"
          >
            <div className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0
              ${formCadastro.is_admin ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
            `}>
              <input
                id="cadastro-is-admin"
                type="checkbox"
                checked={formCadastro.is_admin}
                onChange={(e) => setFormCadastro(f => ({ ...f, is_admin: e.target.checked }))}
                className="sr-only"
              />
              {formCadastro.is_admin && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">É Administrador?</span>
              <p className="text-xs text-slate-500 mt-0.5">Concede acesso total ao painel de administração</p>
            </div>
          </label>

          {/* Erro do cadastro */}
          {erroCadastro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {erroCadastro}
            </div>
          )}

          {!isOnline && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Servidor indisponível. O usuário será salvo localmente e sincronizado automaticamente.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setCadastrarModal(false); setErroCadastro('') }}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-cadastro"
              onClick={handleSalvarCadastro}
              disabled={salvandoCadastro}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {salvandoCadastro ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Cadastrando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Cadastrar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================
          MODAL: EDITAR USUÁRIO
          ============================ */}
      <Modal
        isOpen={editarModal.aberto}
        onClose={() => { setEditarModal({ aberto: false, usuario: null }); setErroEdicao('') }}
        title="Editar Usuário"
      >
        <div className="flex flex-col gap-5">
          {editarModal.usuario && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(editarModal.usuario.nome)}`}>
                {getIniciais(editarModal.usuario.nome)}
              </div>
              <div>
                <span className="text-xs text-slate-500">Editando</span>
                <p className="text-sm font-bold text-slate-900">{editarModal.usuario.nome}</p>
              </div>
            </div>
          )}

          <Input
            label="Nome Completo"
            id="edicao-nome"
            type="text"
            placeholder="Ex: Maria Silva"
            value={formEdicao.nome}
            onChange={(e) => setFormEdicao(f => ({ ...f, nome: e.target.value }))}
          />
          <Input
            label="E-mail"
            id="edicao-email"
            type="email"
            placeholder="Ex: maria@escola.edu.br"
            value={formEdicao.email}
            onChange={(e) => setFormEdicao(f => ({ ...f, email: e.target.value }))}
          />

          {/* Checkbox É Administrador */}
          <label
            htmlFor="edicao-is-admin"
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 select-none"
          >
            <div className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0
              ${formEdicao.is_admin ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
            `}>
              <input
                id="edicao-is-admin"
                type="checkbox"
                checked={formEdicao.is_admin}
                onChange={(e) => setFormEdicao(f => ({ ...f, is_admin: e.target.checked }))}
                className="sr-only"
              />
              {formEdicao.is_admin && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">É Administrador?</span>
              <p className="text-xs text-slate-500 mt-0.5">Concede acesso total ao painel de administração</p>
            </div>
          </label>

          {/* Erro da edição */}
          {erroEdicao && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {erroEdicao}
            </div>
          )}

          {!isOnline && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 text-xs font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Servidor indisponível. A edição será salva na fila e sincronizada automaticamente.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setEditarModal({ aberto: false, usuario: null }); setErroEdicao('') }}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-edicao"
              onClick={handleSalvarEdicao}
              disabled={salvandoEdicao}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {salvandoEdicao ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================
          MODAL: DETALHES (Somente Leitura)
          ============================ */}
      <Modal
        isOpen={detalhesModal.aberto}
        onClose={() => setDetalhesModal({ aberto: false, usuario: null })}
        title="Detalhes do Usuário"
      >
        {detalhesModal.usuario && (() => {
          const u = detalhesModal.usuario
          const pendente = isPendente(u)
          return (
            <div className="flex flex-col gap-5">
              {/* Avatar + Info principal */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-blue-100">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${getAvatarColor(u.nome)}`}>
                  {getIniciais(u.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{u.nome || 'Sem nome'}</h3>
                  <p className="text-sm text-slate-500 truncate">{u.email || '—'}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Administrador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-700 text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Estudante
                      </span>
                    )}
                    {pendente && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sincronização Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Aviso de conta offline pendente */}
              {pendente && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3.5 text-sm">
                  <svg className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    <strong className="font-semibold">Conta criada offline.</strong> Este usuário ainda não foi sincronizado com o servidor. Edição e exclusão ficarão disponíveis após a sincronização automática.
                  </span>
                </div>
              )}

              {/* Dados detalhados */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ID', value: pendente ? 'Temporário (offline)' : `#${u.id}` },
                  { label: 'Nível de Acesso', value: u.nivel || (u.is_admin ? 'admin' : 'estudante') },
                  { label: 'Nome', value: u.nome || '—' },
                  { label: 'E-mail', value: u.email || '—' },
                  { label: 'Data de Cadastro', value: formatarData(u.data_criacao) },
                  { label: 'Último Acesso', value: formatarData(u.ultimo_acesso) },
                ].map(({ label, value }) => (
                  <div key={label} className={`flex flex-col gap-1 p-3 bg-slate-50 rounded-xl ${label === 'Nome' || label === 'E-mail' || label === 'Data de Cadastro' || label === 'Último Acesso' ? '' : ''}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-800 break-all">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setDetalhesModal({ aberto: false, usuario: null })}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          )
        })()}
      </Modal>

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
