from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from app.core.database import Base

class Tarefa(Base):
    __tablename__ = "tarefas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="SET NULL"), nullable=True)
    
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    data_entrega = Column(DateTime, nullable=True)
    
    # Adicionado o 'em_andamento' aqui no Enum do Python também!
    status = Column(Enum('pendente', 'em_andamento', 'concluida', 'cancelada'), default='pendente', nullable=False)
    
    ativo = Column(Boolean, nullable=False, default=True)
    data_criacao = Column(DateTime, default=func.now(), nullable=False)
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)