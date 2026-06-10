from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- O QUE O FRONTEND RECEBE PARA RENDERIZAR A TELA ---
class Alternativa(BaseModel):
    letra: str
    texto: str

class QuestaoPadronizada(BaseModel):
    identificador_externo: str
    origem: str
    enunciado: str
    alternativas: List[Alternativa]
    alternativa_correta: str

class SessaoResponse(BaseModel):
    sessao_id: int
    questoes: List[QuestaoPadronizada]

# --- O QUE O FRONTEND ENVIA PARA A API ---
class SessaoCreate(BaseModel):
    disciplina_id: Optional[int] = None
    tema: Optional[str] = None
    modo: str # 'vestibular' ou 'ia'
    quantidade_questoes: int = 5

class RespostaCreate(BaseModel):
    identificador_externo: str
    pergunta: str
    alternativa_marcada: Optional[str] = None
    alternativa_correta: str
    origem: str