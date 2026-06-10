from pydantic import BaseModel
from datetime import datetime

class NotificacaoBase(BaseModel):
    titulo: str
    descricao: str

class NotificacaoCreate(NotificacaoBase):
    pass

class NotificacaoResponse(NotificacaoBase):
    id: int
    data_criacao: datetime
    lida: bool

    class Config:
        from_attributes = True