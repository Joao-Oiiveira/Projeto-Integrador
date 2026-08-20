from app.core.database import SessionLocal
from sqlalchemy import text
from app.models.disciplina import Disciplina

db = SessionLocal()

# 1. Torna a coluna usuario_id do MySQL NULLABLE
db.execute(text("ALTER TABLE disciplinas MODIFY usuario_id INT NULL"))

# Materias padroes que serao globais
materias_padroes = ['Matematica', 'Portugues', 'Ciencias', 'Fisica', 'Quimica', 'Biologia', 'Historia', 'Geografia']

for nome in materias_padroes:
    # 2. Cria a disciplina global (se nao existir)
    global_disc = db.query(Disciplina).filter(Disciplina.nome.ilike(f'%{nome}%'), Disciplina.usuario_id == None).first()
    if not global_disc:
        global_disc = Disciplina(nome=nome, descricao=f'{nome} Geral', origem='sistema', ativo=True)
        db.add(global_disc)
        db.commit()
        db.refresh(global_disc)
    
    # 3. Busca todas as duplicatas especificas de usuarios para essa materia
    duplicatas = db.query(Disciplina).filter(Disciplina.nome.ilike(f'%{nome}%'), Disciplina.usuario_id != None).all()
    
    for d in duplicatas:
        # Migra dependencias
        for tabela in ['tarefas', 'eventos', 'flashcard_baralhos', 'trilha_modulos']:
            try:
                db.execute(text(f"UPDATE {tabela} SET disciplina_id = {global_disc.id} WHERE disciplina_id = {d.id}"))
            except Exception:
                pass
        # Apaga a duplicata do usuario
        db.delete(d)
    
    # Se for matematica, garante que tem as 3 trilhas sem duplicar
    if nome == 'Matematica':
        # Remove todas as trilhas atuais de matematica
        db.execute(text(f"DELETE FROM trilha_modulos WHERE disciplina_id = {global_disc.id}"))
        
        # Insere as 3 unicas originais
        db.execute(text(f"INSERT INTO trilha_modulos (disciplina_id, nome, ordem, nivel) VALUES ({global_disc.id}, 'Fracoes e Porcentagem', 1, 1)"))
        db.execute(text(f"INSERT INTO trilha_modulos (disciplina_id, nome, ordem, nivel) VALUES ({global_disc.id}, 'Equacoes do 1 Grau', 2, 1)"))
        db.execute(text(f"INSERT INTO trilha_modulos (disciplina_id, nome, ordem, nivel) VALUES ({global_disc.id}, 'Geometria Basica', 3, 2)"))
        
    db.commit()

print('Migracao concluida! Todas as disciplinas padroes agora sao GLOBAIS e unicas!')
