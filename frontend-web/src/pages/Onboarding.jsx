import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import TextSpacingControls from '../components/TextSpacingControls';
import TTSReader from '../components/TTSReader';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { saveOnboardingDataAPI, getLoggedUser } from '../services/auth';

const Onboarding = () => {
  const navigate = useNavigate();
  const { configuracoes, updateAccessibility } = useAccessibility();

  useEffect(() => {
    const user = getLoggedUser();
    if (!user) navigate('/login');
    if (user?.perfil) navigate('/dashboard');
  }, [navigate]);

  const user = getLoggedUser();
  const [nome, setNome] = useState(user?.nome || '');
  
  // Estado limpo: apenas as opções utilizadas
  const [perfil, setPerfil] = useState({
    dificuldade_leitura: false,
    tdah: false,
    autismo: false,
  });

  const handlePerfilChange = (campo) => {
    setPerfil((prev) => {
      const novoValor = !prev[campo];
      const novoPerfil = { ...prev, [campo]: novoValor };

      // REGRA DE NEGÓCIO: Auto-ativação imediata de Acessibilidade
      if (novoValor === true) { 
        if (campo === 'dificuldade_leitura') {
          updateAccessibility({ 
            fonte_dislexia: true,
            espacamento_linhas: configuracoes.espacamento_linhas === 'padrao' ? 'moderado' : configuracoes.espacamento_linhas 
          });
        }
        if (campo === 'autismo') {
          updateAccessibility({ tema_escuro: true });
        }
      }

      return novoPerfil;
    });
  };

  const handleConfiguracoesChange = (campo) => {
    updateAccessibility({ [campo]: !configuracoes[campo] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, preencha seu nome.");
      return;
    }

    try {
      await saveOnboardingDataAPI(nome, perfil, configuracoes);
      window.location.href = '/dashboard'; 
    } catch (error) {
      alert(error.message || "Erro ao salvar dados.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7FE] dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 md:p-12 flex justify-center items-center transition-colors duration-300">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3 text-purple-600 dark:text-purple-400">Bem-vindo ao EduAcess</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Para personalizar sua experiência, precisamos conhecer um pouco mais sobre você e suas necessidades de aprendizado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">1. Dados Básicos</h2>
            <Input 
              id="nome" 
              label="Como gostaria de ser chamado?" 
              placeholder="Digite seu nome ou apelido" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">2. Perfil de Aprendizagem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox id="tdah" label="Tenho TDAH" description="Ajuda a reduzir distrações na interface" checked={perfil.tdah} onChange={() => handlePerfilChange('tdah')} />
              <Checkbox id="autismo" label="Estou no Espectro Autista" description="Interfaces mais previsíveis e sem poluição" checked={perfil.autismo} onChange={() => handlePerfilChange('autismo')} />
              <Checkbox id="dificuldade_leitura" label="Dificuldade de Leitura (ex: Dislexia)" description="Ativa fonte especial automaticamente" checked={perfil.dificuldade_leitura} onChange={() => handlePerfilChange('dificuldade_leitura')} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">3. Acessibilidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Checkbox 
                id="tema_escuro" 
                label="Tema Escuro / Alto Contraste" 
                description="Reduz o brilho e eleva o contraste para descanso visual" 
                checked={configuracoes.tema_escuro} 
                onChange={() => handleConfiguracoesChange('tema_escuro')} 
              />
              <Checkbox 
                id="fonte_dislexia" 
                label="Fonte para Dislexia" 
                description="Aplica a fonte OpenDyslexic globalmente" 
                checked={configuracoes.fonte_dislexia} 
                onChange={() => handleConfiguracoesChange('fonte_dislexia')} 
              />
              <Checkbox 
                id="leitura_texto" 
                label="Leitura de Texto (Text-to-Speech)" 
                description="Ativa o botão de ler textos em voz alta" 
                checked={configuracoes.leitura_texto} 
                onChange={() => handleConfiguracoesChange('leitura_texto')} 
              />
              
              {/* Select adaptado para Light e Dark Mode */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors">
                <label htmlFor="tamanho_fonte" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho da Fonte (Base)</label>
                <select 
                  id="tamanho_fonte"
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer shadow-sm"
                  value={configuracoes.tamanho_fonte}
                  onChange={(e) => updateAccessibility({ tamanho_fonte: Number(e.target.value) })}
                >
                  <option value={16}>Padrão (16px)</option>
                  <option value={20}>Grande (20px)</option>
                  <option value={24}>Extra Grande (24px)</option>
                </select>
              </div>
            </div>

            {/* Ajuste de Espaçamento entre Linhas, Letras e Palavras */}
            <TextSpacingControls 
              configuracoes={configuracoes}
              onChange={(novasConfigs) => updateAccessibility(novasConfigs)}
            />
          </section>

          {/* Botão atualizado para roxo padrão */}
          <Button type="submit" text="Concluir e Ir para o Dashboard" className="mt-4 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white border-none" />
        </form>

      </div>
      <TTSReader />
    </main>
  );
};

export default Onboarding;