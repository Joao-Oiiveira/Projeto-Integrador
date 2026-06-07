from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# --- BARALHOS ---
class BaralhoBase(BaseModel):
    nome: str
    disciplina_id: Optional[int] = None

class BaralhoCreate(BaralhoBase): pass
class BaralhoUpdate(BaralhoBase): pass

class BaralhoResponse(BaralhoBase):
    id: int
    data_criacao: datetime
    class Config: from_attributes = True

# --- FLASHCARDS ---
class FlashcardBase(BaseModel):
    pergunta: str
    resposta: str

class FlashcardCreate(FlashcardBase):
    baralho_id: int

class FlashcardUpdate(FlashcardBase): pass

class FlashcardResponse(FlashcardBase):
    id: int
    baralho_id: int
    data_criacao: datetime
    data_atualizacao: datetime
    class Config: from_attributes = True

# --- PROGRESSO (ESTUDO) ---
class ResultadoEstudo(BaseModel):
    acertou: bool