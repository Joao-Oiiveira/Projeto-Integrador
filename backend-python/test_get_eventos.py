import requests
from app.core.database import engine
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.api.rotas_auth import create_access_token
from datetime import timedelta

with Session(engine) as db:
    user = db.query(Usuario).first()
    token = create_access_token({"sub": user.email}, timedelta(minutes=30))
    res = requests.get("http://localhost:8000/eventos/", headers={"Authorization": f"Bearer {token}"})
    print(res.status_code)
    print(res.text)
