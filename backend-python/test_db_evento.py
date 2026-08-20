import asyncio
from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.usuario import Usuario
from app.models.disciplina import Disciplina
from app.models.evento import Evento

with Session(engine) as db:
    try:
        novo_evento = Evento(titulo="Teste", descricao="D", data_inicio="2026-08-19T20:00:00", data_fim="2026-08-19T21:00:00", cor="#FF0000", usuario_id=13)
        db.add(novo_evento)
        db.commit()
        db.refresh(novo_evento)
        print("OK", novo_evento.id)
    except Exception as e:
        import traceback
        traceback.print_exc()
