from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base com os campos que o usuário preenche
class TarefaBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_entrega: Optional[datetime] = None
    disciplina_id: Optional[int] = None

class TarefaCreate(TarefaBase):
    pass

class TarefaUpdate(TarefaBase):
    pass

# Usado especificamente para quando arrastamos a tarefa no Kanban (muda só o status)
class TarefaStatusUpdate(BaseModel):
    status: str

# O que o Python devolve para o React
class TarefaResponse(TarefaBase):
    id: int
    status: str
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True