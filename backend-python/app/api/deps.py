from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.usuario import Usuario

# Define onde o frontend deve mandar o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_usuario_atual(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Descriptografa o token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Busca o usuário no banco
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception
        
    return usuario

# NOVA FUNÇÃO DE ADMIN (Encostada no canto esquerdo)
def get_admin_atual(usuario_atual: Usuario = Depends(get_usuario_atual)):
    if not usuario_atual.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Privilégios de administrador necessários."
        )
    return usuario_atual