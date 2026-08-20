import asyncio
from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.usuario import Usuario
from app.api.rotas_auth import create_access_token
import requests
from datetime import timedelta

with Session(engine) as db:
    user = db.query(Usuario).first()
    if user:
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        print(f"Token gerado para {user.email}")
        
        # Testar criacao de evento
        data = {
            "titulo": "Teste",
            "descricao": "Desc",
            "data_inicio": "2026-08-19T20:00:00.000",
            "data_fim": "2026-08-19T21:00:00.000",
            "cor": "#FF0000"
        }
        res = requests.post(
            "http://localhost:8000/eventos/",
            json=data,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(res.status_code, res.text)
    else:
        print("Nenhum usuario.")
