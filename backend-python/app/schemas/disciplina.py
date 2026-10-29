from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.core.validators import validar_texto_obrigatorio, validar_texto_opcional

class DisciplinaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "nome da disciplina", min_tamanho=2, max_tamanho=100, min_letras=2)

    @field_validator('descricao')
    @classmethod
    def validar_descricao(cls, v: Optional[str]) -> Optional[str]:
        return validar_texto_opcional(v, "descrição da disciplina", max_tamanho=500)

class DisciplinaCreate(DisciplinaBase):
    pass

class DisciplinaUpdate(DisciplinaBase):
    pass

class DisciplinaResponse(DisciplinaBase):
    id: int
    origem: Optional[str]
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True
