from pydantic import BaseModel, EmailStr
from typing import Optional

# --- SCHEMAS DE ENTRADA (O que o Frontend envia) ---

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class PerfilUpdate(BaseModel):
    dificuldade_leitura: bool = False
    tdah: bool = False
    autismo: bool = False
    prefere_visual: bool = False
    prefere_auditivo: bool = False

class ConfiguracoesUpdate(BaseModel):
    tamanho_fonte: int = 16
    leitura_texto: bool = False
    tema_escuro: bool = False
    fonte_dislexia: bool = False

class OnboardingUpdate(BaseModel):
    nome: str
    perfil: PerfilUpdate
    configuracoes: ConfiguracoesUpdate

# --- SCHEMAS DE SAÍDA (O que a API devolve) ---

class PerfilResponse(PerfilUpdate):
    id: int
    class Config:
        from_attributes = True

class ConfiguracoesResponse(ConfiguracoesUpdate):
    id: int
    class Config:
        from_attributes = True

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    perfil: Optional[PerfilResponse] = None
    configuracoes: Optional[ConfiguracoesResponse] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse