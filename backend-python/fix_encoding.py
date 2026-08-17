from app.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

db.execute(text("UPDATE trilha_modulos SET nome = 'Fracoes e Porcentagem' WHERE ordem = 1"))
db.execute(text("UPDATE trilha_modulos SET nome = 'Equacoes do 1 Grau' WHERE ordem = 2"))
db.execute(text("UPDATE trilha_modulos SET nome = 'Geometria Basica' WHERE ordem = 3"))

db.commit()
print('Nomes atualizados!')
