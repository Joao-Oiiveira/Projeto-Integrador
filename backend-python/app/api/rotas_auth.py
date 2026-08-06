from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.usuario import Usuario, PerfilUsuario, ConfiguracoesUsuario
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, GoogleLoginRequest, TokenResponse, UsuarioResponse, OnboardingUpdate
from app.api.deps import get_usuario_atual
from app.core.firebase import verificar_token_firebase

router = APIRouter()


# 1. Função de Cadastro (Registro)
@router.post("/registrar", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registrar(user_in: UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se email já existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    # Cria usuário com senha criptografada
    novo_usuario = Usuario(
        nome=user_in.nome,
        email=user_in.email,
        senha=get_password_hash(user_in.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    # Gera o token de login automático
    access_token = create_access_token(data={"sub": novo_usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": novo_usuario}

# 2. Função de Autenticação (Login)
@router.post("/login", response_model=TokenResponse)
def login(user_in: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == user_in.email).first()
    
    if not usuario or not verify_password(user_in.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    access_token = create_access_token(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario}

# 3. Pegar usuário logado (Usado quando o app é reaberto)
@router.get("/me", response_model=UsuarioResponse)
def obter_usuario_logado(usuario_atual: Usuario = Depends(get_usuario_atual)):
    return usuario_atual

# 4. Salvar dados do Onboarding
@router.post("/onboarding", response_model=UsuarioResponse)
def salvar_onboarding(dados: OnboardingUpdate, db: Session = Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    
    # Atualiza o nome
    usuario_atual.nome = dados.nome
    
    # Atualiza ou cria o Perfil
    if usuario_atual.perfil:
        for key, value in dados.perfil.dict().items():
            setattr(usuario_atual.perfil, key, value)
    else:
        novo_perfil = PerfilUsuario(**dados.perfil.dict(), usuario_id=usuario_atual.id)
        db.add(novo_perfil)
        
    # Atualiza ou cria as Configurações
    if usuario_atual.configuracoes:
        for key, value in dados.configuracoes.dict().items():
            setattr(usuario_atual.configuracoes, key, value)
    else:
        novas_configs = ConfiguracoesUsuario(**dados.configuracoes.dict(), usuario_id=usuario_atual.id)
        db.add(novas_configs)
        
    db.commit()
    db.refresh(usuario_atual)
    
    return usuario_atual

# 5. Login / Cadastro via Google (Firebase Auth)
@router.post("/google", response_model=TokenResponse)
def login_com_google(dados: GoogleLoginRequest, db: Session = Depends(get_db)):
    # Valida o ID Token recebido do Firebase
    token_decodificado = verificar_token_firebase(dados.id_token)
    
    email = token_decodificado.get("email")
    nome = token_decodificado.get("name") or (email.split("@")[0] if email else "Usuário Google")
    
    if not email:
        raise HTTPException(status_code=400, detail="E-mail não retornado pelo Firebase.")
        
    # Busca o usuário no MySQL
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    # Se não existir, cadastra automaticamente no MySQL
    if not usuario:
        usuario = Usuario(
            nome=nome,
            email=email,
            senha=get_password_hash("GOOGLE_SSO_USER_NO_PASSWORD")
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
    # Gera o Token de acesso do nosso aplicativo
    access_token = create_access_token(data={"sub": usuario.email})
    return {"access_token": access_token, "token_type": "bearer", "usuario": usuario}