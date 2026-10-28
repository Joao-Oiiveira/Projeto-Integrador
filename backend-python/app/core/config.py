import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env (garantindo o caminho mesmo se executado fora da pasta)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "EduAcess API"
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")

settings = Settings()
