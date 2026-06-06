from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.flashcard import Baralho, Flashcard, ProgressoFlashcard
from app.schemas.flashcard import BaralhoCreate, BaralhoUpdate, BaralhoResponse, FlashcardCreate, FlashcardUpdate, FlashcardResponse, ResultadoEstudo

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
    # Busca todos os flashcards que pertencem aos baralhos do usuário
    return db.query(Flashcard).join(Baralho).filter(Baralho.usuario_id == usuario.id).all()

# ==========================================
# ROTA DE ESTUDO (PROGRESSO)
# ==========================================
@router.post("/flashcards/{flashcard_id}/estudo")
def registrar_estudo(flashcard_id: int, resultado: ResultadoEstudo, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    from sqlalchemy.sql import func
    
    progresso = db.query(ProgressoFlashcard).filter(ProgressoFlashcard.usuario_id == usuario.id, ProgressoFlashcard.flashcard_id == flashcard_id).first()
    
    if not progresso:
        # CORREÇÃO AQUI: Adicionado acertos=0 e erros=0 explicitamente
        progresso = ProgressoFlashcard(
            usuario_id=usuario.id, 
            flashcard_id=flashcard_id, 
            acertos=0, 
            erros=0
        )
        db.add(progresso)
        
    if resultado.acertou:
        progresso.acertos += 1
    else:
        progresso.erros += 1
        
    progresso.ultima_revisao = func.now()
    db.commit()
    return {"status": "ok"}

@router.put("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
def atualizar_flashcard(flashcard_id: int, flashcard_in: FlashcardUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: raise HTTPException(status_code=404, detail="Flashcard não encontrado.")
    
    flashcard.pergunta = flashcard_in.pergunta
    flashcard.resposta = flashcard_in.resposta
    db.commit()
    db.refresh(flashcard)
    return flashcard

@router.delete("/flashcards/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_flashcard(flashcard_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    flashcard = db.query(Flashcard).join(Baralho).filter(Flashcard.id == flashcard_id, Baralho.usuario_id == usuario.id).first()
    if not flashcard: raise HTTPException(status_code=404, detail="Flashcard não encontrado.")
    db.delete(flashcard)
    db.commit()
    return None

# ==========================================
# ROTA DE ESTUDO (PROGRESSO)
# ==========================================
@router.post("/flashcards/{flashcard_id}/estudo")
def registrar_estudo(flashcard_id: int, resultado: ResultadoEstudo, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    from sqlalchemy.sql import func
    
    progresso = db.query(ProgressoFlashcard).filter(ProgressoFlashcard.usuario_id == usuario.id, ProgressoFlashcard.flashcard_id == flashcard_id).first()
    
    if not progresso:
        progresso = ProgressoFlashcard(usuario_id=usuario.id, flashcard_id=flashcard_id)
        db.add(progresso)
        
    if resultado.acertou:
        progresso.acertos += 1
    else:
        progresso.erros += 1
        
    progresso.ultima_revisao = func.now()
    db.commit()
    return {"status": "ok"}