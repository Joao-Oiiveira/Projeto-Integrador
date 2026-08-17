import os
import sys

# Adiciona o diretório atual ao PYTHONPATH para que os imports funcionem
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from app.core.database import Base, engine
from app.models.disciplina import Disciplina
from app.models.usuario import Usuario
from app.models.trilha import TrilhaModulo, TrilhaQuestao, ProgressoTrilha

def criar_tabelas():
    print("Criando tabelas da trilha e progresso no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso!")

if __name__ == "__main__":
    criar_tabelas()
