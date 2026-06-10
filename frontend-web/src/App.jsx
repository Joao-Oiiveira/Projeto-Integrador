import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tarefas from './pages/Tarefas';
import Disciplinas from './pages/Disciplinas';
import Flashcards from './pages/Flashcards';
import Agenda from './pages/Agenda';
import Exercicios from './pages/Exercicios';
import Configuracoes from './pages/Configuracoes';

function App() {
  return (
    // Envelopando toda a aplicação com o Contexto de Acessibilidade
    <AccessibilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Rotas protegidas (Envelopadas pelo Layout) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/disciplinas" element={<Disciplinas />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/calendario" element={<Agenda />} />
            <Route path="/exercicios" element={<Exercicios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;