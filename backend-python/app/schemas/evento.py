from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
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