import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { obterDisciplinas, criarDisciplina, atualizarDisciplina, excluirDisciplina } from '../services/disciplinas';

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[editandoId, setEditandoId] = useState(null);

  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  const carregarDados = () => {
    setDisciplinas(obterDisciplinas());
  };

  useEffect(() => {
    carregarDados();
  },[]);

  const abrirModalNova = () => {
    setEditandoId(null);
    setFormData({ nome: '', descricao: '' });
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (disciplina) => {
    setEditandoId(disciplina.id);
    setFormData({ nome: disciplina.nome, descricao: disciplina.descricao });
    setIsModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome da disciplina é obrigatório.");
      return;
    }

    try {
      if (editandoId) {
        atualizarDisciplina(editandoId, formData);
      } else {
        criarDisciplina(formData);
      }
      carregarDados();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExcluir = (id) => {
    if (window.confirm("Deseja realmente excluir esta disciplina?")) {
      try {
        excluirDisciplina(id);
        carregarDados();
      } catch (error) {
        // Exibe o erro gerado na regra de negócio (se houver tarefas vinculadas)
        alert(error.message); 
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disciplinas</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas matérias e áreas de estudo.</p>
        </div>
        <Button 
          text="+ Nova Disciplina" 
          onClick={abrirModalNova} 
          className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-purple-200 whitespace-nowrap"
        />
      </div>

      {/* Lista de Disciplinas (Grid Responsivo) */}
      {disciplinas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-gray-200 p-10 mt-4 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma disciplina cadastrada</h3>
          <p className="text-gray-500 max-w-sm mb-6">Comece criando disciplinas como "Matemática" ou "Programação" para organizar suas tarefas e estudos.</p>
          <Button text="Criar Primeira Disciplina" onClick={abrirModalNova} className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none shadow-none" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {disciplinas.map((disciplina) => (
            <div key={disciplina.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase ${disciplina.cor || 'bg-gray-100 text-gray-700'}`}>
                  {disciplina.nome.substring(0, 20)}
                </div>
                
                {/* Ações */}
                <div className="flex gap-1">
                  <button onClick={() => abrirModalEdicao(disciplina)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleExcluir(disciplina.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{disciplina.nome}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                {disciplina.descricao || 'Sem descrição cadastrada.'}
              </p>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                <span>Criada manualmente</span>
                <span>Ativa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Disciplina" : "Nova Disciplina"}>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          <Input 
            id="nome" 
            label="Nome da Disciplina *" 
            placeholder="Ex: Matemática, História..." 
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">Descrição (Opcional)</label>
            <textarea
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 transition-all resize-none h-24"
              placeholder="O que você estuda nesta disciplina?"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            ></textarea>
          </div>

          <Button type="submit" text={editandoId ? "Salvar Alterações" : "Criar Disciplina"} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white" />
        </form>
      </Modal>
    </div>
  );
};

export default Disciplinas;