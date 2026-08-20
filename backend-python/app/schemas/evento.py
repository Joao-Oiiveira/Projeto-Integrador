from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    cor: Optional[str] = "#3B82F6"
    disciplina_id: Optional[int] = None

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