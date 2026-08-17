from pydantic import BaseModel
from typing import List, Optional

# Schemas para Módulos
class TrilhaModuloBase(BaseModel):
    nome: str
    ordem: int
    nivel: int

class TrilhaModuloCreate(TrilhaModuloBase):
    disciplina_id: int

class TrilhaModuloResponse(TrilhaModuloBase):
    id: int
    disciplina_id: int

    class Config:
        from_attributes = True

# Schemas para Questões da Trilha (Banco)
class TrilhaQuestaoBase(BaseModel):
    enunciado: str
    alternativas: List[str]
    alternativa_correta: int
    explicacao_ia: Optional[str] = None

class TrilhaQuestaoCreate(TrilhaQuestaoBase):
    modulo_id: int

class TrilhaQuestaoResponse(TrilhaQuestaoBase):
    id: int
    modulo_id: int

    class Config:
        from_attributes = True

# Schemas para Geração IA (Tempo Real)
class IAGerarRequest(BaseModel):
    tema: str
    quantidade: int = 5
    nivel: str = "Médio"

# Schema de Progresso
class ProgressoTrilhaResponse(BaseModel):
    modulo_id: int
    concluido: bool
    acertos: int
    erros: int

    class Config:
        from_attributes = True
