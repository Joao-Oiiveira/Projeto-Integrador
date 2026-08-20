import asyncio
from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.models.trilha import TrilhaModulo, TrilhaQuestao
from app.services.ia_service import ia_service
import json

db = SessionLocal()

# Pega o id da disciplina global de matematica
from app.models.disciplina import Disciplina
mat = db.query(Disciplina).filter(Disciplina.nome == 'Matematica', Disciplina.usuario_id == None).first()

if not mat:
    print("Matematica global nao encontrada!")
    exit(1)

modulos = db.query(TrilhaModulo).filter(TrilhaModulo.disciplina_id == mat.id).all()

for m in modulos:
    # Se ja tiver questoes, limpa
    db.query(TrilhaQuestao).filter(TrilhaQuestao.modulo_id == m.id).delete()
    db.commit()

    print(f"Gerando 5 questoes curtas para o modulo: {m.nome}...")
    
    # Gera com a IA
    questoes = ia_service.gerar_questoes(tema=m.nome, quantidade=5, nivel="Médio")
    
    # Salva no banco
    for q in questoes:
        nova_q = TrilhaQuestao(
            modulo_id=m.id,
            enunciado=q['enunciado'],
            alternativas=json.dumps(q['alternativas']),
            alternativa_correta=q['alternativa_correta'],
            explicacao_ia=q['explicacao_ia']
        )
        db.add(nova_q)
    
    db.commit()
    print(f"Salvas {len(questoes)} questoes para {m.nome}.")

print("Processo finalizado!")
