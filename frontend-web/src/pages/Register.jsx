import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { registerAPI } from '../services/auth'; // <-- Importação atualizada

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // <-- Função agora é async
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // <-- Adicionado o await
      await registerAPI(nome, email, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col md:flex-row-reverse w-full max-w-[1000px] bg-gray-900 rounded-[2rem] p-3 shadow-2xl border border-gray-800">
        
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-gray-400 text-sm">Junte-se ao EduAcess hoje mesmo</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Input id="nome" label="Nome Completo" type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input id="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button type="submit" text="Cadastrar" className="w-full mt-2" />
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Já possui uma conta? <Link to="/login" className="text-white font-semibold hover:text-purple-400 transition-colors">Fazer Login</Link>
          </p>
        </div>

        <div className="hidden md:flex w-1/2 relative rounded-[1.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-purple-900 to-black opacity-90"></div>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Estudantes" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"/>
          <div className="absolute top-6 left-6 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg">e.</div>
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="text-white text-3xl font-light leading-snug">Educação para <br /><span className="font-bold text-purple-400">Todos</span></h2>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;