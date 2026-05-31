from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import rotas_auth

# Inicializa a API
app = FastAPI(title="EduAcess API", description="API para a plataforma educacional EduAcess")

# Configuração de CORS (Permite que o React/Flutter conversem com a API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, colocaríamos o domínio do frontend aqui
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas de autenticação
app.include_router(rotas_auth.router, prefix="/auth", tags=["Autenticação"])

@app.get("/")
def read_root():
    return {"mensagem": "Bem-vindo à API do EduAcess!"}