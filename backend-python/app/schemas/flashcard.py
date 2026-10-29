from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.core.validators import validar_texto_obrigatorio

# --- BARALHOS ---
class BaralhoBase(BaseModel):
    nome: str
    disciplina_id: Optional[int] = None

    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "nome do baralho", min_tamanho=2, max_tamanho=100, min_letras=2)

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

    @field_validator('pergunta')
    @classmethod
    def validar_pergunta(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "pergunta do flashcard", min_tamanho=2, max_tamanho=500, min_letras=2)

    @field_validator('resposta')
    @classmethod
    def validar_resposta(cls, v: str) -> str:
        return validar_texto_obrigatorio(v, "resposta do flashcard", min_tamanho=1, max_tamanho=1000, min_letras=1)

class FlashcardCreate(FlashcardBase):
    baralho_id: int

class FlashcardUpdate(FlashcardBase): pass

class FlashcardResponse(FlashcardBase):
    id: int
    baralho_id: int
    acertos: Optional[int] = 0
    erros: Optional[int] = 0
    proxima_revisao: Optional[datetime] = None
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config: 
        from_attributes = True

# --- PROGRESSO (ESTUDO) ---
class ResultadoEstudo(BaseModel):
    acertou: bool
