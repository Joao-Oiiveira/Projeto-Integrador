from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DisciplinaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

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