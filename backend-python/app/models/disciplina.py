from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Disciplina(Base):
    __tablename__ = "disciplinas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    origem = Column(String(20), nullable=True, default="manual")
    ativo = Column(Boolean, nullable=False, default=True)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)