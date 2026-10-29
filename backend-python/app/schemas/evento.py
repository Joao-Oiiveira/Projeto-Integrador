from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.core.validators import validar_texto_obrigatorio, validar_texto_opcional

class EventoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    disciplina_id: Optional[int] = None

    @field_validator('titulo')
    @classmethod
    def validar_titulo(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "título do evento", min_tamanho=2, max_tamanho=150, min_letras=2)

    @field_validator('descricao')
    @classmethod
    def validar_descricao(cls, v: Optional[str]) -> Optional[str]:
        return validar_texto_opcional(v, "descrição do evento", max_tamanho=500)

class EventoCreate(EventoBase):
    pass

class EventoUpdate(EventoBase):
    pass

class EventoResponse(EventoBase):
    id: int
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True
