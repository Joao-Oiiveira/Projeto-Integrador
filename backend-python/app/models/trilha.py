from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class TrilhaModulo(Base):
    __tablename__ = "trilha_modulos"

    id = Column(Integer, primary_key=True, index=True)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    nome = Column(String(100), nullable=False)
    ordem = Column(Integer, nullable=False)
    nivel = Column(Integer, default=1)

    disciplina = relationship("Disciplina")
    questoes = relationship("TrilhaQuestao", back_populates="modulo")

class TrilhaQuestao(Base):
    __tablename__ = "trilha_questoes"

    id = Column(Integer, primary_key=True, index=True)
    modulo_id = Column(Integer, ForeignKey("trilha_modulos.id"))
    enunciado = Column(String(500), nullable=False)
    alternativas = Column(String(1000), nullable=False) # List of strings as JSON string
    alternativa_correta = Column(Integer, nullable=False) # 0 to N
    explicacao_ia = Column(String(1000), nullable=True)

    modulo = relationship("TrilhaModulo", back_populates="questoes")

class ProgressoTrilha(Base):
    __tablename__ = "progresso_trilhas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    modulo_id = Column(Integer, ForeignKey("trilha_modulos.id"))
    concluido = Column(Boolean, default=False)
    acertos = Column(Integer, default=0)
    erros = Column(Integer, default=0)

    usuario = relationship("Usuario")
    modulo = relationship("TrilhaModulo")
