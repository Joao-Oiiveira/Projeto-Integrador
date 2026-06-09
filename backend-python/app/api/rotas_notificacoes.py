from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.notificacao import Notificacao
from app.schemas.notificacao import NotificacaoCreate, NotificacaoResponse

router = APIRouter()

# 1. Listar todas as notificações do usuário (Mais novas primeiro)
@router.get("/", response_model=List[NotificacaoResponse])
def listar_notificacoes(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    return db.query(Notificacao).filter(Notificacao.usuario_id == usuario.id).order_by(Notificacao.data_criacao.desc()).all()

# 2. Criar uma notificação (Útil para testarmos o sistema)
@router.post("/", response_model=NotificacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_notificacao(notif_in: NotificacaoCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    nova = Notificacao(**notif_in.dict(), usuario_id=usuario.id)
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

# 3. Marcar uma notificação específica como lida
@router.patch("/{notificacao_id}/lida")
def marcar_como_lida(notificacao_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id, Notificacao.usuario_id == usuario.id).first()
    if not notificacao:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    notificacao.lida = True
    db.commit()
    return {"status": "ok"}

# 4. Marcar TODAS como lidas (Botão "Limpar tudo")
@router.patch("/marcar-todas-lidas")
def marcar_todas_lidas(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    db.query(Notificacao).filter(Notificacao.usuario_id == usuario.id, Notificacao.lida == False).update({"lida": True})
    db.commit()
    return {"status": "ok"}

# 5. Excluir notificação
@router.delete("/{notificacao_id}")
def excluir_notificacao(notificacao_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id, Notificacao.usuario_id == usuario.id).first()
    if not notificacao:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    db.delete(notificacao)
    db.commit()
    return {"status": "ok"}