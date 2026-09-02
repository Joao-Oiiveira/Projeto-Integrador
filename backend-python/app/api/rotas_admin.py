from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_admin_atual
from app.models.usuario import Usuario
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

# 1. Listar todos os usuários (Apenas Admin)
@router.get("/usuarios", response_model=List[UsuarioAdminResponse])
def listar_todos_usuarios(db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    return db.query(Usuario).all()

# 2. Alterar a senha de um usuário (Apenas Admin)
@router.put("/usuarios/{usuario_id}/senha")
def alterar_senha_usuario(usuario_id: int, dados: UsuarioSenhaUpdate, db: Session = Depends(get_db), admin: Usuario = Depends(get_admin_atual)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    usuario.senha = get_password_hash(dados.nova_senha)
    db.commit()
    return {"status": "Senha atualizada com sucesso"}

# 3. Excluir/Banir um usuário (Apenas Admin)
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