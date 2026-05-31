from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Cria o "motor" de conexão com o banco
engine = create_engine(settings.DATABASE_URL)

# Cria a fábrica de sessões (cada requisição na API abrirá uma sessão)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base que usaremos para criar nossas tabelas no Python depois
Base = declarative_base()

# Função para pegar a conexão com o banco (usaremos muito nas rotas)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()