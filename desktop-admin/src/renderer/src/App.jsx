// App.jsx — Roteamento principal do Painel Administrativo
// HashRouter é obrigatório no Electron (não há servidor para URLs de histórico)
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginAdmin from './pages/LoginAdmin'

// Placeholder do Dashboard — será substituído na próxima etapa
function DashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <h1 className="text-white text-xl font-bold">Dashboard em construção</h1>
        <p className="text-gray-400 text-sm mt-1">Login realizado com sucesso! ✅</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Redireciona a raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Tela de Login */}
        <Route path="/login" element={<LoginAdmin />} />

        {/* Dashboard — placeholder até a próxima etapa */}
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Routes>
    </HashRouter>
  )
}

export default App
