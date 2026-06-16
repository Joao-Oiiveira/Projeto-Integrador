import React, { useState, useEffect, useRef } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import ConfirmModal from '../components/ConfirmModal';
import { obterDisciplinasAPI, criarDisciplinaAPI, atualizarDisciplinaAPI, excluirDisciplinaAPI } from '../services/disciplinas';

const CORES_DISPONIVEIS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', 
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', 
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', 
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
];

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  // Estados e Ref para a Importação
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const carregarDados = async () => {
    try {
      const dados = await obterDisciplinasAPI();
      setDisciplinas(dados);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalNova = () => {
    setEditandoId(null);
    setFormData({ nome: '', descricao: '' });
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (disciplina) => {
    setEditandoId(disciplina.id);
    setFormData({ nome: disciplina.nome, descricao: disciplina.descricao || '' });
    setIsModalOpen(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome da disciplina é obrigatório.");
      return;
    }

    try {
      if (editandoId) {
        await atualizarDisciplinaAPI(editandoId, formData);
      } else {
        await criarDisciplinaAPI(formData);
      }
      await carregarDados();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // ==========================================
  // LÓGICA DE EXCLUSÃO COM CONFIRM MODAL
  // ==========================================
  const handleExcluirClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmarExclusao = async () => {
    try {
      await excluirDisciplinaAPI(confirmModal.id);
      await carregarDados();
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      alert(error.message); 
    }
  };

  // ==========================================
  // LÓGICA DE IMPORTAÇÃO DE JSON
  // ==========================================
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const conteudo = e.target.result;
        const dadosParsed = JSON.parse(conteudo);

        if (!Array.isArray(dadosParsed)) {
          throw new Error("O arquivo JSON deve conter um array de objetos (ex: [{nome: '...', descricao: '...'}]).");
        }

        let importadas = 0;
        for (const item of dadosParsed) {
          if (item.nome) { 
            await criarDisciplinaAPI({
              nome: item.nome,
              descricao: item.descricao || ''
            });
            importadas++;
          }
        }

        alert(`${importadas} disciplina(s) importada(s) com sucesso!`);
        await carregarDados();
      } catch (error) {
        alert("Erro ao importar: " + (error.message || "Formato de arquivo inválido."));
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    };

    reader.onerror = () => {
      alert("Erro ao ler o arquivo.");
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie suas matérias e áreas de estudo.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap shadow-sm
              ${isImporting 
                ? 'bg-purple-400 cursor-wait text-white/90 border-none' 
                : 'bg-purple-600 hover:bg-purple-700 text-white border-none'
              }`}
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Importando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Importar JSON
              </>
            )}
          </button>

          <Button 
            text="+ Nova Disciplina" 
            onClick={abrirModalNova} 
            disabled={isImporting}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm whitespace-nowrap" 
          />
        </div>
      </div>

      {disciplinas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 p-10 mt-4 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhuma disciplina cadastrada</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Comece criando disciplinas como "Matemática" ou importe uma lista via JSON.</p>
          <Button text="Criar Primeira Disciplina" onClick={abrirModalNova} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-none shadow-none" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {disciplinas.map((disciplina, index) => {
            const corDinamica = CORES_DISPONIVEIS[index % CORES_DISPONIVEIS.length];

            return (
              <div key={disciplina.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase ${corDinamica}`}>
                    {disciplina.nome.substring(0, 20)}
                  </div>
                  
                  <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirModalEdicao(disciplina)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {/* CORREÇÃO: Usando handleExcluirClick */}
                    <button onClick={() => handleExcluirClick(disciplina.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{disciplina.nome}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 flex-1">
                  {disciplina.descricao || 'Sem descrição cadastrada.'}
                </p>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span>Criada manualmente</span>
                  <span>Ativa</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Disciplina" : "Nova Disciplina"}>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <Input id="nome" label="Nome da Disciplina *" placeholder="Ex: Matemática, História..." value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 transition-all resize-none h-24"
              placeholder="O que você estuda nesta disciplina?"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            ></textarea>
          </div>

          <Button type="submit" text={editandoId ? "Salvar Alterações" : "Criar Disciplina"} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white" />
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Excluir Disciplina"
        message="Tem certeza que deseja excluir esta disciplina? Esta ação não poderá ser desfeita e pode afetar tarefas vinculadas a ela."
        confirmText="Excluir Disciplina"
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
};

export default Disciplinas;