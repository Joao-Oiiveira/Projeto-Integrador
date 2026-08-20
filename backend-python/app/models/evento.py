from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="SET NULL"), nullable=True)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=False)
    cor = Column(String(7), nullable=True, default="#3B82F6")
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)