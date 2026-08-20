from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

# --- SCHEMAS DE ENTRADA (O que o Frontend envia) ---

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

    # Validador de Senha Forte (Padrão de Mercado)
    @field_validator('senha')
    @classmethod
    def validar_senha(cls, v):
        if len(v) < 8:
            raise ValueError('A senha deve ter no mínimo 8 caracteres.')
        if not re.search(r'\d', v):
            raise ValueError('A senha deve conter pelo menos um número.')
        if not re.search(r'[A-Z]', v):
            raise ValueError('A senha deve conter pelo menos uma letra maiúscula.')
        return v

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class GoogleLoginRequest(BaseModel):
    id_token: str



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
    nivel: int = 1
    is_admin: bool = False
    perfil: Optional[PerfilResponse] = None
    configuracoes: Optional[ConfiguracoesResponse] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: UsuarioResponse