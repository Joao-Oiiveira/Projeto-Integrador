from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.evento import Evento
from app.schemas.evento import EventoCreate, EventoUpdate, EventoResponse

router = APIRouter()

@router.get("/", response_model=List[EventoResponse])
def listar_eventos(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    return db.query(Evento).filter(Evento.usuario_id == usuario.id).all()

@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(evento_in: EventoCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    novo_evento = Evento(**evento_in.dict(), usuario_id=usuario.id)
    db.add(novo_evento)
    db.commit()
    db.refresh(novo_evento)
    return novo_evento

@router.put("/{evento_id}", response_model=EventoResponse)
def atualizar_evento(evento_id: int, evento_in: EventoUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    evento = db.query(Evento).filter(Evento.id == evento_id, Evento.usuario_id == usuario.id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    
    for key, value in evento_in.dict().items():
        setattr(evento, key, value)
        
    db.commit()
    db.refresh(evento)
    return evento

@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_evento(evento_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    evento = db.query(Evento).filter(Evento.id == evento_id, Evento.usuario_id == usuario.id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    
    db.delete(evento)
    db.commit()
    return None