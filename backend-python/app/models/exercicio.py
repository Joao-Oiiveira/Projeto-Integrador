from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class SessaoExercicio(Base):
    __tablename__ = "sessoes_exercicios"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="SET NULL"), nullable=True)
    tema = Column(String(150), nullable=True)
    modo = Column(Enum('vestibular', 'ia'), nullable=False)
    dificuldade = Column(String(20), nullable=True)
    quantidade_questoes = Column(Integer, nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)

    # Relacionamento para buscar o histórico facilmente depois
    respostas = relationship("RespostaQuestao", back_populates="sessao", cascade="all, delete-orphan")

class RespostaQuestao(Base):
    __tablename__ = "respostas_questoes"

    id = Column(Integer, primary_key=True, index=True)
    sessao_id = Column(Integer, ForeignKey("sessoes_exercicios.id", ondelete="CASCADE"), nullable=False)
    identificador_externo = Column(String(100), nullable=False)
    pergunta = Column(Text, nullable=False)
    alternativa_marcada = Column(String(1), nullable=True) # Pode ser nulo se o aluno pular
    alternativa_correta = Column(String(1), nullable=False)
    acertou = Column(Boolean, nullable=False)
    origem = Column(String(20), nullable=False)
    data_resposta = Column(DateTime, default=func.now(), nullable=False)

    sessao = relationship("SessaoExercicio", back_populates="respostas")