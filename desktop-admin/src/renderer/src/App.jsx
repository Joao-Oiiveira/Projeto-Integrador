// App.jsx — Roteamento principal do Painel Administrativo
// HashRouter é obrigatório no Electron (não há servidor para URLs de histórico)
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginAdmin from './pages/LoginAdmin'
import AdminLayout from './layouts/AdminLayout'
import DashboardAdmin from './pages/DashboardAdmin'
import UsersList from './pages/UsersList'

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Redireciona a raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Tela de Login (fora do layout) */}
        <Route path="/login" element={<LoginAdmin />} />

        {/* Rotas protegidas dentro do AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/usuarios" element={<UsersList />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
