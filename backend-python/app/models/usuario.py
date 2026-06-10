from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    data_criacao = Column(DateTime, default=func.now())
    data_atualizacao = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos (uselist=False garante que é 1 para 1)
    perfil = relationship("PerfilUsuario", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    configuracoes = relationship("ConfiguracoesUsuario", back_populates="usuario", uselist=False, cascade="all, delete-orphan")

class PerfilUsuario(Base):
    __tablename__ = "perfil_usuario"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    dificuldade_leitura = Column(Boolean, default=False)
    tdah = Column(Boolean, default=False)
    autismo = Column(Boolean, default=False)
    prefere_visual = Column(Boolean, default=False)
    prefere_auditivo = Column(Boolean, default=False)

    usuario = relationship("Usuario", back_populates="perfil")

class ConfiguracoesUsuario(Base):
    __tablename__ = "configuracoes_usuario"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    tamanho_fonte = Column(Integer, default=16)
    leitura_texto = Column(Boolean, default=False)
    
    # NOVOS CAMPOS
    tema_escuro = Column(Boolean, default=False)
    fonte_dislexia = Column(Boolean, default=False)

    usuario = relationship("Usuario", back_populates="configuracoes")