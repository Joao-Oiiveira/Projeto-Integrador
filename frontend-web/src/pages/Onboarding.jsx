// pages/Onboarding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import { saveOnboardingData, getLoggedUser } from '../services/auth';

const Onboarding = () => {
  const navigate = useNavigate();

  // Redireciona se não estiver logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) navigate('/login');
    if (user?.perfil_usuario) navigate('/dashboard'); // Já preencheu, vai pro app
  }, [navigate]);

  //Estado
  const user = getLoggedUser(); // Pega o usuário da sessão
  const [nome, setNome] = useState(user?.nome || ''); // Preenche com o nome, se existir
  // Estado para a Tabela: perfil_usuario
  const[perfil, setPerfil] = useState({
    dificuldade_leitura: false,
    tdah: false,
    autismo: false,
    prefere_visual: false,
    prefere_auditivo: false,
  });

  // Estado para a Tabela: configuracoes_usuario
  const[configuracoes, setConfiguracoes] = useState({
    tamanho_fonte: 16, // Valor padrão em pixels
    alto_contraste: false,
    leitura_texto: false,
  });

  const handlePerfilChange = (campo) => {
    setPerfil((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleConfiguracoesChange = (campo) => {
    setConfiguracoes((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, preencha seu nome.");
      return;
    }

    try {
      // Salva no mock usando a estrutura relacional do banco
      saveOnboardingData(nome, perfil, configuracoes);
      navigate('/dashboard');
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-gray-900 rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-800">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3 text-purple-400">Bem-vindo ao EduAcess</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Para personalizar sua experiência, precisamos conhecer um pouco mais sobre você e suas necessidades de aprendizado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* SEÇÃO 1: Dados Básicos */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">1. Dados Básicos</h2>
            <Input 
              id="nome" 
              label="Como gostaria de ser chamado?" 
              placeholder="Digite seu nome ou apelido" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </section>

          {/* SEÇÃO 2: Perfil de Aprendizagem */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">2. Perfil de Aprendizagem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox 
                id="tdah" 
                label="Tenho TDAH" 
                description="Ajuda a reduzir distrações na interface"
                checked={perfil.tdah}
                onChange={() => handlePerfilChange('tdah')}
              />
              <Checkbox 
                id="autismo" 
                label="Estou no Espectro Autista" 
                description="Interfaces mais previsíveis e sem poluição"
                checked={perfil.autismo}
                onChange={() => handlePerfilChange('autismo')}
              />
              <Checkbox 
                id="dificuldade_leitura" 
                label="Dificuldade de Leitura (ex: Dislexia)" 
                description="Fontes específicas e maior espaçamento"
                checked={perfil.dificuldade_leitura}
                onChange={() => handlePerfilChange('dificuldade_leitura')}
              />
              <Checkbox 
                id="prefere_visual" 
                label="Aprendizado Visual" 
                description="Prefiro imagens, mapas mentais e gráficos"
                checked={perfil.prefere_visual}
                onChange={() => handlePerfilChange('prefere_visual')}
              />
              <Checkbox 
                id="prefere_auditivo" 
                label="Aprendizado Auditivo" 
                description="Prefiro explicações em áudio"
                checked={perfil.prefere_auditivo}
                onChange={() => handlePerfilChange('prefere_auditivo')}
              />
            </div>
          </section>

          {/* SEÇÃO 3: Configurações de Acessibilidade */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">3. Acessibilidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox 
                id="alto_contraste" 
                label="Modo de Alto Contraste" 
                description="Aumenta o contraste das cores do sistema"
                checked={configuracoes.alto_contraste}
                onChange={() => handleConfiguracoesChange('alto_contraste')}
              />
              <Checkbox 
                id="leitura_texto" 
                label="Leitura de Texto (Text-to-Speech)" 
                description="Ativa o botão de ler textos em voz alta"
                checked={configuracoes.leitura_texto}
                onChange={() => handleConfiguracoesChange('leitura_texto')}
              />
              
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-800 bg-gray-900/50">
                <label className="text-sm font-medium text-white">Tamanho da Fonte (Base)</label>
                <select 
                  className="bg-gray-800 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-purple-500 border-none outline-none"
                  value={configuracoes.tamanho_fonte}
                  onChange={(e) => setConfiguracoes(prev => ({...prev, tamanho_fonte: Number(e.target.value)}))}
                >
                  <option value={14}>Pequena (14px)</option>
                  <option value={16}>Padrão (16px)</option>
                  <option value={20}>Grande (20px)</option>
                  <option value={24}>Extra Grande (24px)</option>
                </select>
              </div>
            </div>
          </section>

          <Button type="submit" text="Concluir e Ir para o Dashboard" className="mt-4 py-4 text-lg" />
        </form>

      </div>
    </div>
  );
};

export default Onboarding;