from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Conquista(Base):
    __tablename__ = "conquistas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=False)
    icone = Column(String(50), nullable=False) # Ex: 'menu_book'
    cor_icone = Column(String(20), nullable=False) # Ex: '0xFF1976D2'
    cor_fundo = Column(String(20), nullable=False) # Ex: '0xFFE3F2FD'
    meta_objetivo = Column(Integer, nullable=False, default=1)
    
    # Identificador para sabermos no backend qual lógica usar (ex: 'tarefa_1', 'tarefa_10', 'matematica_10')
    tipo_objetivo = Column(String(50), nullable=False, unique=True)
    
    data_criacao = Column(DateTime, default=func.now(), nullable=False)

class UsuarioConquista(Base):
    __tablename__ = "usuario_conquistas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    conquista_id = Column(Integer, ForeignKey("conquistas.id", ondelete="CASCADE"), nullable=False)
    
    progresso = Column(Integer, default=0, nullable=False)
    desbloqueada = Column(Boolean, default=False, nullable=False)
    data_desbloqueio = Column(DateTime, nullable=True)

    usuario = relationship("Usuario", backref="conquistas_usuario")
    conquista = relationship("Conquista", backref="usuarios_conquistas")
