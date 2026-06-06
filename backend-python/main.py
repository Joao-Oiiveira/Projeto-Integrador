from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa todas as rotas em uma linha só (bem mais limpo!)
from app.api import rotas_auth, rotas_disciplinas, rotas_tarefas, rotas_flashcards, rotas_eventos

# ...
app.include_router(rotas_eventos.router, prefix="/eventos", tags=["Eventos"])

# Inicializa a API
app = FastAPI(title="EduAcess API", description="API para a plataforma educacional EduAcess")

# Configuração de CORS corrigida
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite qualquer origem no ambiente de desenvolvimento
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra TODAS as rotas do sistema
app.include_router(rotas_auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(rotas_disciplinas.router, prefix="/disciplinas", tags=["Disciplinas"])
app.include_router(rotas_tarefas.router, prefix="/tarefas", tags=["Tarefas"])
app.include_router(rotas_flashcards.router, prefix="/estudos", tags=["Flashcards"])
app.include_router(rotas_eventos.router, prefix="/eventos", tags=["Eventos"])

@app.get("/")
def read_root():
    return {"mensagem": "Bem-vindo à API do EduAcess!"}