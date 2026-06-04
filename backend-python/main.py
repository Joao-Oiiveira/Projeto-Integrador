from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import rotas_auth
from app.api import rotas_auth, rotas_disciplinas


# Inicializa a API
app = FastAPI(title="EduAcess API", description="API para a plataforma educacional EduAcess")

# Configuração de CORS corrigida
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite qualquer origem no ambiente de desenvolvimento
    allow_credentials=False, # <-- CORRIGIDO AQUI
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas de autenticação
app.include_router(rotas_auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(rotas_disciplinas.router, prefix="/disciplinas", tags=["Disciplinas"])

@app.get("/")
def read_root():
    return {"mensagem": "Bem-vindo à API do EduAcess!"}