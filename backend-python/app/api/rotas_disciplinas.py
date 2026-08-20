from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_usuario_atual
from app.models.usuario import Usuario
from app.models.disciplina import Disciplina
from app.models.tarefa import Tarefa
from app.schemas.disciplina import DisciplinaCreate, DisciplinaUpdate, DisciplinaResponse

router = APIRouter()

# 1. Listar Disciplinas
@router.get("/", response_model=List[DisciplinaResponse])
def listar_disciplinas(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    from sqlalchemy import or_
    return db.query(Disciplina).filter(
        or_(Disciplina.usuario_id == usuario.id, Disciplina.usuario_id == None),
        Disciplina.ativo == True
    ).all()

# 2. Criar Disciplina
@router.post("/", response_model=DisciplinaResponse, status_code=status.HTTP_201_CREATED)
def criar_disciplina(disciplina_in: DisciplinaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    nova_disciplina = Disciplina(
        usuario_id=usuario.id,
        nome=disciplina_in.nome,
        descricao=disciplina_in.descricao,
        origem="manual",
        ativo=True
    )
    db.add(nova_disciplina)
    db.commit()
    db.refresh(nova_disciplina)
    return nova_disciplina

# 3. Atualizar Disciplina
@router.put("/{disciplina_id}", response_model=DisciplinaResponse)
def atualizar_disciplina(disciplina_id: int, disciplina_in: DisciplinaUpdate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    disciplina = db.query(Disciplina).filter(Disciplina.id == disciplina_id, Disciplina.usuario_id == usuario.id).first()
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")
    
    disciplina.nome = disciplina_in.nome
    disciplina.descricao = disciplina_in.descricao
    db.commit()
    db.refresh(disciplina)
    return disciplina

# 4. Excluir Disciplina (Com Regra de Negócio)
@router.delete("/{disciplina_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_disciplina(disciplina_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_atual)):
    disciplina = db.query(Disciplina).filter(Disciplina.id == disciplina_id, Disciplina.usuario_id == usuario.id).first()
    if not disciplina:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")
    
    # REGRA DE NEGÓCIO: Bloquear exclusão se houver tarefas atreladas
    tarefas_vinculadas = db.query(Tarefa).filter(Tarefa.disciplina_id == disciplina_id).first()
    if tarefas_vinculadas:
        raise HTTPException(status_code=400, detail="Esta disciplina possui tarefas vinculadas. Conclua ou exclua as tarefas primeiro!")
    
    db.delete(disciplina)
    db.commit()
    return None