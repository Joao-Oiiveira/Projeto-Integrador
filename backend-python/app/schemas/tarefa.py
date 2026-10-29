from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.core.validators import validar_texto_obrigatorio, validar_texto_opcional

# Base com os campos que o usuário preenche
class TarefaBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_entrega: Optional[datetime] = None
    disciplina_id: Optional[int] = None

    @field_validator('titulo')
    @classmethod
    def validar_titulo(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "título da tarefa", min_tamanho=2, max_tamanho=150, min_letras=2)

    @field_validator('descricao')
    @classmethod
    def validar_descricao(cls, v: Optional[str]) -> Optional[str]:
        return validar_texto_opcional(v, "descrição da tarefa", max_tamanho=500)

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
