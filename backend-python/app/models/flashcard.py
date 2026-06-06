from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Baralho(Base):
    __tablename__ = "baralhos_flashcards"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="SET NULL"), nullable=True)
    nome = Column(String(100), nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    baralho_id = Column(Integer, ForeignKey("baralhos_flashcards.id", ondelete="CASCADE"), nullable=False)
    pergunta = Column(Text, nullable=False)
    resposta = Column(Text, nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class ProgressoFlashcard(Base):
    __tablename__ = "progresso_flashcard"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False)
    acertos = Column(Integer, default=0, nullable=False)
    erros = Column(Integer, default=0, nullable=False)
    ultima_revisao = Column(DateTime, nullable=True)
    proxima_revisao = Column(DateTime, nullable=True)