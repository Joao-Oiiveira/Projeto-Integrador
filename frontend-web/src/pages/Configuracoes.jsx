import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import TextSpacingControls from '../components/TextSpacingControls';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getLoggedUser, saveOnboardingDataAPI } from '../services/auth';

const Configuracoes = () => {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const { configuracoes, updateAccessibility } = useAccessibility();

  useEffect(() => {
    const user = getLoggedUser();
    if (user) setNome(user.nome || '');
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return alert("O nome não pode ficar vazio.");
    
    setLoading(true);
    try {
      const user = getLoggedUser();
      // Envia o novo nome, mantendo o perfil e as configurações intactas
      await saveOnboardingDataAPI(nome, user.perfil || user.perfil_usuario, user.configuracoes);
      alert("Nome atualizado com sucesso!");
      window.location.reload(); // Recarrega para atualizar o nome no Header
    } catch (error) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full pb-8 animate-fade-in w-full max-w-3xl mx-auto mt-4">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Gerencie seu perfil e saiba mais sobre o sistema.</p>
      </div>

      {/* Formulário de Perfil */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Meu Perfil</h2>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <Input 
            id="nome" 
            label="Nome de Exibição" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
          />
          <Button 
            type="submit" 
            text={loading ? "Salvando..." : "Salvar Alterações"} 
            className="w-full sm:w-auto self-end mt-2 bg-purple-600 hover:bg-purple-700 text-white border-none px-8" 
          />
        </form>
      </div>

      {/* Ajustes de Acessibilidade */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acessibilidade</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Personalize a exibição do texto e recursos assistivos de acordo com sua preferência.</p>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox id="conf_tema_escuro" label="Tema Escuro (Dark Mode)" description="Reduz o brilho da tela" checked={configuracoes.tema_escuro} onChange={() => updateAccessibility({ tema_escuro: !configuracoes.tema_escuro })} />
            <Checkbox id="conf_fonte_dislexia" label="Fonte para Dislexia" description="Aplica a fonte OpenDyslexic" checked={configuracoes.fonte_dislexia} onChange={() => updateAccessibility({ fonte_dislexia: !configuracoes.fonte_dislexia })} />
            <Checkbox id="conf_leitura_texto" label="Leitura de Texto (TTS)" description="Ativa o botão flutuante de leitura" checked={configuracoes.leitura_texto} onChange={() => updateAccessibility({ leitura_texto: !configuracoes.leitura_texto })} />
            
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho da Fonte (Base)</label>
              <select 
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer" 
                value={configuracoes.tamanho_fonte} 
                onChange={(e) => updateAccessibility({ tamanho_fonte: Number(e.target.value) })}
              >
                <option value={16}>Padrão (16px)</option>
                <option value={20}>Grande (20px)</option>
                <option value={24}>Extra Grande (24px)</option>
              </select>
            </div>
          </div>

          <TextSpacingControls
            configuracoes={configuracoes}
            onChange={(novasConfigs) => updateAccessibility(novasConfigs)}
          />
        </div>
      </div>

      {/* Sobre o EduAcess */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2rem] shadow-lg text-white relative overflow-hidden">
        <svg className="absolute right-0 bottom-0 w-48 h-48 text-white opacity-10 transform translate-x-10 translate-y-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A120.138 120.138 0 0013.989 0A119.908 119.908 0 0115.97 20.54a119.908 119.908 0 00-2.616 12.02A119.933 119.933 0 011.046 11.3c2.56.46 5.152.793 7.784 1.011A119.82 119.82 0 0111.3 1.046z" clipRule="evenodd" /></svg>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white text-purple-700 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xl">e.</div>
            <h2 className="text-2xl font-bold">Sobre o EduAcess</h2>
          </div>
          <p className="text-purple-100 leading-relaxed mb-4">
            Este sistema é fruto de um Trabalho de Conclusão de Curso (TCC) focado em revolucionar a organização acadêmica.
          </p>
          <p className="text-purple-100 leading-relaxed">
            Nosso principal objetivo é promover a <strong>inclusão</strong> através de tecnologias assistivas e inteligência artificial, criando um ambiente de estudo adaptável para pessoas com TDAH, Dislexia, Autismo e outras necessidades de aprendizagem.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Configuracoes;