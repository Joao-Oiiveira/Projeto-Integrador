from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Notificacao(Base):
    __tablename__ = "notificacoes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=False)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    lida = Column(Boolean, default=False, nullable=False)