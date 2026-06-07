from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Importa todas as rotas
from app.api import rotas_auth, rotas_disciplinas, rotas_tarefas, rotas_flashcards, rotas_eventos

# 2. Inicializa a API (O 'app' nasce aqui)
app = FastAPI(title="EduAcess API", description="API para a plataforma educacional EduAcess")

# 3. Configurações de Segurança (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Registra todas as rotas (Agora o Python já sabe o que é o 'app')
app.include_router(rotas_auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(rotas_disciplinas.router, prefix="/disciplinas", tags=["Disciplinas"])
app.include_router(rotas_tarefas.router, prefix="/tarefas", tags=["Tarefas"])
app.include_router(rotas_flashcards.router, prefix="/estudos", tags=["Flashcards"])
app.include_router(rotas_eventos.router, prefix="/eventos", tags=["Eventos"])

# 5. Rota raiz de teste
@app.get("/")
def read_root():
    return {"mensagem": "Bem-vindo à API do EduAcess!"}