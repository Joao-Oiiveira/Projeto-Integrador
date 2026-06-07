from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.tarefa import Tarefa
from app.schemas.tarefa import TarefaCreate, TarefaUpdate, TarefaStatusUpdate, TarefaResponse

router = APIRouter()

# 1. obterTarefas
@router.get("/", response_model=List[TarefaResponse])
def listar_tarefas(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    return db.query(Tarefa).filter(Tarefa.usuario_id == usuario.id, Tarefa.ativo == True).all()

# 2. criarTarefa
@router.post("/", response_model=TarefaResponse, status_code=status.HTTP_201_CREATED)
def criar_tarefa(tarefa_in: TarefaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    nova_tarefa = Tarefa(
        usuario_id=usuario.id,
        disciplina_id=tarefa_in.disciplina_id,
        titulo=tarefa_in.titulo,
        descricao=tarefa_in.descricao,
        data_entrega=tarefa_in.data_entrega,
        status="pendente",
        ativo=True
    )
    db.add(nova_tarefa)
    db.commit()
    db.refresh(nova_tarefa)
    return nova_tarefa

# 3. atualizarTarefa
@router.put("/{tarefa_id}", response_model=TarefaResponse)
def atualizar_tarefa(tarefa_id: int, tarefa_in: TarefaUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == usuario.id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    
    tarefa.titulo = tarefa_in.titulo
    tarefa.descricao = tarefa_in.descricao
    tarefa.data_entrega = tarefa_in.data_entrega
    tarefa.disciplina_id = tarefa_in.disciplina_id
        
    db.commit()
    db.refresh(tarefa)
    return tarefa

# 4. atualizarStatusTarefa
@router.patch("/{tarefa_id}/status", response_model=TarefaResponse)
def atualizar_status(tarefa_id: int, status_in: TarefaStatusUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == usuario.id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    
    tarefa.status = status_in.status
    db.commit()
    db.refresh(tarefa)
    return tarefa

# 5. excluirTarefa
@router.delete("/{tarefa_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_tarefa(tarefa_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    tarefa = db.query(Tarefa).filter(Tarefa.id == tarefa_id, Tarefa.usuario_id == usuario.id).first()
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    
    db.delete(tarefa)
    db.commit()
    return None