import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import { saveOnboardingDataAPI, getLoggedUser } from '../services/auth';

const Onboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getLoggedUser();
    if (!user) navigate('/login');
    if (user?.perfil) navigate('/dashboard');
  }, [navigate]);

  const user = getLoggedUser();
  const [nome, setNome] = useState(user?.nome || '');
  
  const [perfil, setPerfil] = useState({
    dificuldade_leitura: false,
    tdah: false,
    autismo: false,
    prefere_visual: false,
    prefere_auditivo: false,
  });

  // Estado atualizado para bater EXATAMENTE com o contrato da API Python
  const [configuracoes, setConfiguracoes] = useState({
    tamanho_fonte: 16,
    leitura_texto: false,
    tema_escuro: false,
    fonte_dislexia: false,
  });

  const handlePerfilChange = (campo) => {
    setPerfil((prev) => {
      const novoValor = !prev[campo];
      const novoPerfil = { ...prev, [campo]: novoValor };

      // REGRA DE NEGÓCIO: Auto-ativação de Acessibilidade
      if (novoValor === true) { // Só ativa se o usuário estiver marcando a opção
        if (campo === 'dificuldade_leitura') {
          setConfiguracoes(c => ({ ...c, fonte_dislexia: true }));
        }
        if (campo === 'autismo' || campo === 'prefere_visual') {
          setConfiguracoes(c => ({ ...c, tema_escuro: true }));
        }
      }

      return novoPerfil;
    });
  };

  const handleConfiguracoesChange = (campo) => {
    setConfiguracoes((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, preencha seu nome.");
      return;
    }

    try {
      await saveOnboardingDataAPI(nome, perfil, configuracoes);
      // Força um reload simples para o AccessibilityContext ler os dados novos do localStorage e injetar no HTML
      window.location.href = '/dashboard'; 
    } catch (error) {
      alert(error.message || "Erro ao salvar dados.");
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
          
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">1. Dados Básicos</h2>
            <Input id="nome" label="Como gostaria de ser chamado?" placeholder="Digite seu nome ou apelido" value={nome} onChange={(e) => setNome(e.target.value)} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">2. Perfil de Aprendizagem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox id="tdah" label="Tenho TDAH" description="Ajuda a reduzir distrações na interface" checked={perfil.tdah} onChange={() => handlePerfilChange('tdah')} />
              <Checkbox id="autismo" label="Estou no Espectro Autista" description="Interfaces mais previsíveis e sem poluição" checked={perfil.autismo} onChange={() => handlePerfilChange('autismo')} />
              <Checkbox id="dificuldade_leitura" label="Dificuldade de Leitura (ex: Dislexia)" description="Ativa fonte especial automaticamente" checked={perfil.dificuldade_leitura} onChange={() => handlePerfilChange('dificuldade_leitura')} />
              <Checkbox id="prefere_visual" label="Aprendizado Visual" description="Prefiro imagens, mapas mentais e gráficos" checked={perfil.prefere_visual} onChange={() => handlePerfilChange('prefere_visual')} />
              <Checkbox id="prefere_auditivo" label="Aprendizado Auditivo" description="Prefiro explicações em áudio" checked={perfil.prefere_auditivo} onChange={() => handlePerfilChange('prefere_auditivo')} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-gray-800 pb-2">3. Acessibilidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Opções atualizadas para o contrato da API */}
              <Checkbox id="tema_escuro" label="Tema Escuro (Dark Mode)" description="Reduz o brilho e descansa a visão" checked={configuracoes.tema_escuro} onChange={() => handleConfiguracoesChange('tema_escuro')} />
              <Checkbox id="fonte_dislexia" label="Fonte para Dislexia" description="Aplica a fonte OpenDyslexic globalmente" checked={configuracoes.fonte_dislexia} onChange={() => handleConfiguracoesChange('fonte_dislexia')} />
              <Checkbox id="leitura_texto" label="Leitura de Texto (Text-to-Speech)" description="Ativa o botão de ler textos em voz alta" checked={configuracoes.leitura_texto} onChange={() => handleConfiguracoesChange('leitura_texto')} />
              
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-800 bg-gray-900/50">
                <label className="text-sm font-medium text-white">Tamanho da Fonte (Base)</label>
                <select 
                  className="bg-gray-800 text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-purple-500 border-none outline-none cursor-pointer"
                  value={configuracoes.tamanho_fonte}
                  onChange={(e) => setConfiguracoes(prev => ({...prev, tamanho_fonte: Number(e.target.value)}))}
                >
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