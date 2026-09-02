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

@router.get("/baralhos/{baralho_id}/flashcards", response_model=List[FlashcardResponse])
def listar_flashcards_do_baralho(baralho_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    flashcards = db.query(Flashcard).join(Baralho).filter(
        Flashcard.baralho_id == baralho_id,
        Baralho.usuario_id == usuario.id
    ).all()
    
    resultado = []
    for f in flashcards:
        progresso = db.query(ProgressoFlashcard).filter(
            ProgressoFlashcard.flashcard_id == f.id,
            ProgressoFlashcard.usuario_id == usuario.id
        ).first()
        
        resultado.append({
            "id": f.id,
            "baralho_id": f.baralho_id,
            "pergunta": f.pergunta,
            "resposta": f.resposta,
            "acertos": progresso.acertos if progresso else 0,
            "erros": progresso.erros if progresso else 0,
            "proxima_revisao": progresso.proxima_revisao if progresso else None,
            "data_criacao": f.data_criacao,
            "data_atualizacao": f.data_atualizacao
        })
    return resultado

# ==========================================
# ROTAS DE FLASHCARDS
# ==========================================
# 1. Rota para LISTAR (GET)
@router.get("/flashcards")
def listar_todos_flashcards(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    # Busca todas as cartas dos baralhos do usuário
    flashcards = db.query(Flashcard).join(Baralho).filter(Baralho.usuario_id == usuario.id).all()
    
    resultado = []
    for f in flashcards:
        # Busca o progresso específico desta carta para este usuário
        progresso = db.query(ProgressoFlashcard).filter(
            ProgressoFlashcard.flashcard_id == f.id,
            ProgressoFlashcard.usuario_id == usuario.id
        ).first()
        
        resultado.append({
            "id": f.id,
            "baralho_id": f.baralho_id,
            "pergunta": f.pergunta,
            "resposta": f.resposta,
            "acertos": progresso.acertos if progresso else 0,
            "erros": progresso.erros if progresso else 0,
            "proxima_revisao": progresso.proxima_revisao if progresso else None,
            "data_criacao": f.data_criacao,
            "data_atualizacao": f.data_atualizacao
        })
        
    return resultado

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
# ==========================================
# ROTA DE ESTUDO (PROGRESSO)
# ==========================================
from datetime import datetime, timedelta

class ResultadoEstudo(BaseModel):
    acertou: bool

@router.post("/flashcards/{flashcard_id}/estudo")
def registrar_estudo(flashcard_id: int, resultado: ResultadoEstudo, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: raise HTTPException(status_code=404)
    
    progresso = db.query(ProgressoFlashcard).filter(ProgressoFlashcard.usuario_id == usuario.id, ProgressoFlashcard.flashcard_id == flashcard_id).first()
    
    # Pega a data e hora exata de agora no fuso horário do servidor
    agora = datetime.now()
    
    if not progresso:
        progresso = ProgressoFlashcard(usuario_id=usuario.id, flashcard_id=flashcard_id, acertos=0, erros=0)
        db.add(progresso)
        
    if resultado.acertou:
        progresso.acertos += 1
        dias_pulo = progresso.acertos * 2
        # O Python calcula a data exata do futuro
        progresso.proxima_revisao = agora + timedelta(days=dias_pulo)
    else:
        progresso.erros += 1
        progresso.acertos = 0
        # O Python calcula a data exata de amanhã
        progresso.proxima_revisao = agora + timedelta(days=1)
        
    progresso.ultima_revisao = agora
    
    db.commit()
    return {"status": "ok", "proxima_revisao": progresso.proxima_revisao.isoformat()}
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