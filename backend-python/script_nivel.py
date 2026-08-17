
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as con:
    try:
        con.execute(text('ALTER TABLE usuarios ADD COLUMN nivel INTEGER NOT NULL DEFAULT 1'))
        print('Coluna nivel adicionada com sucesso!')
    except Exception as e:
        print('Erro ao adicionar coluna (ela ja pode existir):', e)
    con.commit()
