from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_admin_atual
from app.models.usuario import Usuario
from app.models.tarefa import Tarefa
from app.models.disciplina import Disciplina
from app.models.flashcard import Flashcard
from app.models.exercicio import SessaoExercicio
from pydantic import BaseModel, EmailStr
from app.core.security import get_password_hash

router = APIRouter()

class UsuarioAdminResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    is_admin: bool
    class Config: from_attributes = True

class UsuarioSenhaUpdate(BaseModel):
    nova_senha: str

class UsuarioAdminCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    is_admin: bool = False

class UsuarioAdminUpdate(BaseModel):
    nome: str
    email: EmailStr
    is_admin: bool

# 1. Listar todos os usuários (Apenas Admin)
@router.get("/usuarios", response_model=List[UsuarioAdminResponse])
def listar_todos_usuarios(db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    return db.query(Usuario).all()

# 2. Criar um novo usuário (Apenas Admin)
@router.post("/usuarios", response_model=UsuarioAdminResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(dados: UsuarioAdminCreate, db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    # Verifica se o e-mail já está em uso
    email_existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if email_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    novo_usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha=get_password_hash(dados.senha),
        is_admin=dados.is_admin
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

# 3. Editar nome, e-mail e nível de acesso de um usuário (Apenas Admin)
@router.put("/usuarios/{usuario_id}", response_model=UsuarioAdminResponse)
def editar_usuario(usuario_id: int, dados: UsuarioAdminUpdate, db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Verifica se o novo e-mail já pertence a outro usuário
    conflito = db.query(Usuario).filter(Usuario.email == dados.email, Usuario.id != usuario_id).first()
    if conflito:
        raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outro usuário.")

    usuario.nome = dados.nome
    usuario.email = dados.email
    usuario.is_admin = dados.is_admin
    db.commit()
    db.refresh(usuario)
    return usuario

# 4. Alterar a senha de um usuário (Apenas Admin)
@router.put("/usuarios/{usuario_id}/senha")
def alterar_senha_usuario(usuario_id: int, dados: UsuarioSenhaUpdate, db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    usuario.senha = get_password_hash(dados.nova_senha)
    db.commit()
    return {"status": "Senha atualizada com sucesso"}

# 5. Excluir/Banir um usuário (Apenas Admin)
@router.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_usuario(usuario_id: int, db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    # Trava de segurança: O admin não pode se auto-excluir
    if usuario_id == admin.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir sua própria conta de administrador.")
        
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    # O banco de dados vai apagar tudo em cascata (tarefas, flashcards, etc)
    db.delete(usuario)
    db.commit()
    return None

# 6. Estatísticas do sistema (Apenas Admin)
@router.get("/estatisticas")
def get_estatisticas(db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    sete_dias_atras = datetime.now() - timedelta(days=7)

    total_usuarios = db.query(Usuario).count()
    novos_ultimos_7_dias = db.query(Usuario).filter(Usuario.data_criacao >= sete_dias_atras).count()

    tarefas_ativas = db.query(Tarefa).filter(Tarefa.ativo == True).count()
    disciplinas_ativas = db.query(Disciplina).filter(Disciplina.ativo == True).count()
    flashcards_criados = db.query(Flashcard).count()
    simulados_realizados = db.query(SessaoExercicio).count()

    return {
        "usuarios": {
            "total": total_usuarios,
            "novos_ultimos_7_dias": novos_ultimos_7_dias
        },
        "engajamento": {
            "tarefas_ativas": tarefas_ativas,
            "disciplinas_ativas": disciplinas_ativas,
            "flashcards_criados": flashcards_criados,
            "simulados_realizados": simulados_realizados
        }
    }