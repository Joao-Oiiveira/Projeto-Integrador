import { getLoggedUser } from './auth';

const DB_BARALHOS = '@EduAcess:baralhos';
const DB_FLASHCARDS = '@EduAcess:flashcards';
const DB_PROGRESSO = '@EduAcess:progresso_flashcards';

// ==========================================
// BARALHOS E FLASHCARDS (CRUD)
// ==========================================
export const obterBaralhos = () => {
  const user = getLoggedUser();
  if (!user) return[];
  const baralhos = JSON.parse(localStorage.getItem(DB_BARALHOS)) ||[];
  return baralhos.filter(b => b.usuario_id === user.id);
};

export const criarBaralho = (dados) => {
  const user = getLoggedUser();
  if (!user) throw new Error("Usuário não autenticado");
  const baralhos = JSON.parse(localStorage.getItem(DB_BARALHOS)) ||[];
  const novoBaralho = {
    id: baralhos.length > 0 ? Math.max(...baralhos.map(b => b.id)) + 1 : 1,
    usuario_id: user.id,
    disciplina_id: Number(dados.disciplina_id),
    nome: dados.nome
  };
  baralhos.push(novoBaralho);
  localStorage.setItem(DB_BARALHOS, JSON.stringify(baralhos));
  return novoBaralho;
};

export const atualizarBaralho = (id, dadosAtualizados) => {
  const baralhos = JSON.parse(localStorage.getItem(DB_BARALHOS)) ||[];
  const index = baralhos.findIndex(b => b.id === id);
  if (index !== -1) {
    baralhos[index] = { ...baralhos[index], ...dadosAtualizados };
    localStorage.setItem(DB_BARALHOS, JSON.stringify(baralhos));
  }
};

export const excluirBaralho = (id) => {
  let baralhos = JSON.parse(localStorage.getItem(DB_BARALHOS)) ||[];
  baralhos = baralhos.filter(b => b.id !== id);
  localStorage.setItem(DB_BARALHOS, JSON.stringify(baralhos));

  let flashcards = JSON.parse(localStorage.getItem(DB_FLASHCARDS)) ||[];
  flashcards = flashcards.filter(f => f.baralho_id !== id);
  localStorage.setItem(DB_FLASHCARDS, JSON.stringify(flashcards));
};

export const obterTodosFlashcards = () => {
  return JSON.parse(localStorage.getItem(DB_FLASHCARDS)) ||[];
};

export const obterFlashcardsDoBaralho = (baralhoId) => {
  const flashcards = obterTodosFlashcards();
  return flashcards.filter(f => f.baralho_id === baralhoId);
};

export const criarFlashcard = (dados) => {
  const flashcards = JSON.parse(localStorage.getItem(DB_FLASHCARDS)) ||[];
  const novoFlashcard = {
    id: flashcards.length > 0 ? Math.max(...flashcards.map(f => f.id)) + 1 : 1,
    baralho_id: Number(dados.baralho_id),
    pergunta: dados.pergunta,
    resposta: dados.resposta,
    data_atualizacao: new Date().toISOString()
  };
  flashcards.push(novoFlashcard);
  localStorage.setItem(DB_FLASHCARDS, JSON.stringify(flashcards));
  return novoFlashcard;
};

export const atualizarFlashcard = (id, dadosAtualizados) => {
  const flashcards = JSON.parse(localStorage.getItem(DB_FLASHCARDS)) ||[];
  const index = flashcards.findIndex(f => f.id === id);
  if (index !== -1) {
    flashcards[index] = { ...flashcards[index], ...dadosAtualizados, data_atualizacao: new Date().toISOString() };
    localStorage.setItem(DB_FLASHCARDS, JSON.stringify(flashcards));
  }
};

export const excluirFlashcard = (id) => {
  let flashcards = JSON.parse(localStorage.getItem(DB_FLASHCARDS)) ||[];
  flashcards = flashcards.filter(f => f.id !== id);
  localStorage.setItem(DB_FLASHCARDS, JSON.stringify(flashcards));
};

// ==========================================
// REGISTRO DE ESTUDO (MOCK BASE PARA O FUTURO)
// ==========================================
export const registrarResultadoEstudo = (flashcardId, acertou) => {
  const user = getLoggedUser();
  if (!user) return;

  const progresso = JSON.parse(localStorage.getItem(DB_PROGRESSO)) ||[];
  let registro = progresso.find(p => p.flashcard_id === flashcardId && p.usuario_id === user.id);

  if (registro) {
    registro.acertos += acertou ? 1 : 0;
    registro.erros += acertou ? 0 : 1;
    registro.ultima_revisao = new Date().toISOString();
  } else {
    registro = {
      id: progresso.length > 0 ? Math.max(...progresso.map(p => p.id)) + 1 : 1,
      usuario_id: user.id,
      flashcard_id: flashcardId,
      acertos: acertou ? 1 : 0,
      erros: acertou ? 0 : 1,
      ultima_revisao: new Date().toISOString(),
      proxima_revisao: null // Lógica de repetição espaçada será aqui no futuro
    };
    progresso.push(registro);
  }

  localStorage.setItem(DB_PROGRESSO, JSON.stringify(progresso));
};