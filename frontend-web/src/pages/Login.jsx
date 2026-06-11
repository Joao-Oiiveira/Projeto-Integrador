import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { loginAPI } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await loginAPI(email, password);
      
      if (!user.perfil) { 
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // Fundo alterado para bg-[#F4F7FE] combinando com o Dashboard
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4 sm:p-8">
      {/* Card alterado para bg-white e borda clara */}
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] bg-white rounded-[2rem] p-3 shadow-2xl border border-gray-100">
        
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
          <div className="text-center mb-10">
            {/* Textos escuros */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar</h1>
            <p className="text-gray-500 text-sm">Insira suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Input id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="flex items-center gap-2 mt-1 mb-4">
              {/* Checkbox em tons claros */}
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500" />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Lembrar de mim</label>
            </div>

            <Button type="submit" text="Entrar" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" />
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Não é membro? <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Criar uma conta</Link>
          </p>
        </div>

        {/* Lado da Imagem (Mantido) */}
        <div className="hidden md:flex w-1/2 relative rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-pink-700 to-gray-900 opacity-90"></div>
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Arte abstrata" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"/>
          <div className="absolute top-6 right-6 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg">e.</div>
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="text-white text-3xl font-light leading-snug">Faça parte de <br /><span className="font-bold">Algo Incrível</span></h2>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;