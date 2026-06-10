from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.flashcard import Baralho, Flashcard, ProgressoFlashcard
from app.schemas.flashcard import BaralhoCreate, BaralhoUpdate, BaralhoResponse, FlashcardCreate, FlashcardUpdate, FlashcardResponse

router = APIRouter()

# ==========================================
# ROTAS DE BARALHOS
# ==========================================
@router.get("/baralhos", response_model=List[BaralhoResponse])
def listar_baralhos(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    return db.query(Baralho).filter(Baralho.usuario_id == usuario.id).all()

@router.post("/baralhos", response_model=BaralhoResponse, status_code=status.HTTP_201_CREATED)
def criar_baralho(baralho_in: BaralhoCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    novo_baralho = Baralho(**baralho_in.dict(), usuario_id=usuario.id)
    db.add(novo_baralho)
    db.commit()
    db.refresh(novo_baralho)
    return novo_baralho

@router.put("/baralhos/{baralho_id}", response_model=BaralhoResponse)
def atualizar_baralho(baralho_id: int, baralho_in: BaralhoUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    baralho = db.query(Baralho).filter(Baralho.id == baralho_id, Baralho.usuario_id == usuario.id).first()
    if not baralho: raise HTTPException(status_code=404, detail="Baralho não encontrado.")
    
    baralho.nome = baralho_in.nome
    baralho.disciplina_id = baralho_in.disciplina_id
    db.commit()
    db.refresh(baralho)
    return baralho

@router.delete("/baralhos/{baralho_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_baralho(baralho_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    baralho = db.query(Baralho).filter(Baralho.id == baralho_id, Baralho.usuario_id == usuario.id).first()
    if not baralho: raise HTTPException(status_code=404, detail="Baralho não encontrado.")
    db.delete(baralho) # O banco apaga os flashcards em cascata automaticamente!
    db.commit()
    return None

# ==========================================
# ROTAS DE FLASHCARDS
# ==========================================
@router.get("/flashcards", response_model=List[FlashcardResponse])
def listar_todos_flashcards(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    return db.query(Flashcard).join(Baralho).filter(Baralho.usuario_id == usuario.id).all()

@router.post("/flashcards", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
def criar_flashcard(flashcard_in: FlashcardCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    baralho = db.query(Baralho).filter(Baralho.id == flashcard_in.baralho_id, Baralho.usuario_id == usuario.id).first()
    if not baralho: 
        raise HTTPException(status_code=403, detail="Baralho inválido.")
    
    novo_flashcard = Flashcard(**flashcard_in.dict())
    db.add(novo_flashcard)
    db.commit()
    db.refresh(novo_flashcard)
    return novo_flashcard

@router.put("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
def atualizar_flashcard(flashcard_id: int, flashcard_in: FlashcardUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: 
        raise HTTPException(status_code=404, detail="Flashcard não encontrado.")
    
    flashcard.pergunta = flashcard_in.pergunta
    flashcard.resposta = flashcard_in.resposta
    db.commit()
    db.refresh(flashcard)
    return flashcard

@router.delete("/flashcards/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_flashcard(flashcard_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: 
        raise HTTPException(status_code=404, detail="Flashcard não encontrado.")
    db.delete(flashcard)
    db.commit()
    return None

# ==========================================
# ROTA DE ESTUDO (PROGRESSO)
# ==========================================
# Rota de Estudo (Com Repetição Espaçada Simples)
from datetime import timedelta

class ResultadoEstudo(BaseModel):
    acertou: bool

@router.post("/flashcards/{flashcard_id}/estudo")
def registrar_estudo(flashcard_id: int, resultado: ResultadoEstudo, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    from sqlalchemy.sql import func
    
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: raise HTTPException(status_code=404)
    
    progresso = db.query(ProgressoFlashcard).filter(ProgressoFlashcard.usuario_id == usuario.id, ProgressoFlashcard.flashcard_id == flashcard_id).first()
    
    if not progresso:
        progresso = ProgressoFlashcard(usuario_id=usuario.id, flashcard_id=flashcard_id, acertos=0, erros=0)
        db.add(progresso)
        
    if resultado.acertou:
        progresso.acertos += 1
        # SRS: Se acertou, joga a próxima revisão para frente (Acertos * 2 dias)
        dias_pulo = progresso.acertos * 2
        progresso.proxima_revisao = func.now() + timedelta(days=dias_pulo)
    else:
        progresso.erros += 1
        # SRS: Se errou, zera os acertos e a revisão é amanhã
        progresso.acertos = 0
        progresso.proxima_revisao = func.now() + timedelta(days=1)
        
    progresso.ultima_revisao = func.now()
    db.commit()
    return {"status": "ok", "proxima_revisao": progresso.proxima_revisao}

# Nova Rota: Gerar Flashcards com IA
from app.services.questoes_service import gerar_flashcards_ia

class GerarFlashcardsRequest(BaseModel):
    tema: str
    dificuldade: str
    quantidade: int

@router.post("/baralhos/{baralho_id}/gerar-ia", response_model=List[FlashcardResponse])
def gerar_flashcards_no_baralho(baralho_id: int, request: GerarFlashcardsRequest, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    baralho = db.query(Baralho).filter(Baralho.id == baralho_id, Baralho.usuario_id == usuario.id).first()
    if not baralho: raise HTTPException(status_code=404)

    cards_gerados = gerar_flashcards_ia(request.tema, request.dificuldade, request.quantidade)
    
    novos_cards = []
    for card in cards_gerados:
        novo = Flashcard(baralho_id=baralho.id, pergunta=card['pergunta'], resposta=card['resposta'])
        db.add(novo)
        novos_cards.append(novo)
        
    db.commit()
    for n in novos_cards: db.refresh(n)
    
    return novos_cards